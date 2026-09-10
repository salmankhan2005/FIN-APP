const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const prisma = new PrismaClient();
const { processReminders } = require('../jobs/cron');
const { dispatchNotification } = require('../services/notification');

// Get Dashboard Summary
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const [dueToday, dueTomorrow, upcoming, overdue, sent, failed] = await Promise.all([
      prisma.repayment.count({ where: { status: 'PENDING', dueDate: { gte: today, lt: tomorrow } } }),
      prisma.repayment.count({ where: { status: 'PENDING', dueDate: { gte: tomorrow, lt: nextWeek } } }), // using nextWeek as "upcoming" for simplicity, or just tomorrow to nextWeek
      prisma.repayment.count({ where: { status: 'PENDING', dueDate: { gt: tomorrow } } }),
      prisma.repayment.count({ where: { status: 'PENDING', dueDate: { lt: today } } }),
      prisma.notificationLog.count({ where: { status: 'SENT' } }),
      prisma.notificationLog.count({ where: { status: 'FAILED' } }),
    ]);

    res.json({
      success: true,
      data: { dueToday, dueTomorrow, upcoming, overdue, sent, failed }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Settings
router.get('/settings', async (req, res) => {
  try {
    let setting = await prisma.reminderSetting.findUnique({ where: { id: 'default' } });
    if (!setting) {
      setting = await prisma.reminderSetting.create({ data: { id: 'default' } });
    }
    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update Settings
router.put('/settings', async (req, res) => {
  try {
    const { enabled, daysBeforeDue } = req.body;
    const setting = await prisma.reminderSetting.upsert({
      where: { id: 'default' },
      update: { enabled, daysBeforeDue: JSON.stringify(daysBeforeDue) },
      create: { id: 'default', enabled, daysBeforeDue: JSON.stringify(daysBeforeDue) }
    });
    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Logs/History
router.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await prisma.notificationLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, phone: true } },
        repayment: { include: { loan: { select: { loanNumber: true } } } }
      }
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Manually trigger Cron Job (for testing)
router.post('/trigger', async (req, res) => {
  try {
    processReminders(); // Async fire and forget
    res.json({ success: true, message: 'Reminder processing started' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get In-App Notifications for current user (Admin/Agent/Customer)
router.get('/in-app', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'CUSTOMER') {
      const myCustomer = await prisma.customer.findFirst({
        where: {
          OR: [
            { userId: req.user.id },
            ...(req.user.phone ? [{ phone: req.user.phone }] : [])
          ]
        }
      });
      if (!myCustomer) return res.json({ success: true, data: [] });

      const appLogs = await prisma.notificationLog.findMany({
        where: { customerId: myCustomer.id, type: 'APP', readAt: null },
        orderBy: { createdAt: 'desc' },
        take: 15,
        include: { customer: { select: { name: true, phone: true } } }
      });
      return res.json({ success: true, data: appLogs });
    }

    const [appLogs, agentCredentialLogs] = await Promise.all([
      prisma.notificationLog.findMany({
        where: { type: 'APP', readAt: null },
        orderBy: { createdAt: 'desc' },
        take: 15,
        include: { customer: { select: { name: true, phone: true } } }
      }),
      prisma.auditLog.findMany({
        where: { action: 'AGENT_CREATED_CUSTOMER_CREDENTIALS' },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    // Format agent credential logs as notifications for Admin
    const credentialAlerts = agentCredentialLogs.map(log => {
      let parsed = {};
      try {
        parsed = typeof log.details === 'string' ? JSON.parse(log.details) : (log.details || {});
      } catch (_) {}

      return {
        id: `agent-cred-${log.id}`,
        type: 'AGENT_CREDENTIAL_CREATED',
        isAgentAlert: true,
        title: 'Agent Created Customer Credentials',
        message: parsed.message || 'Field Agent created login credentials for Customer',
        agentName: parsed.performedBy?.name || 'Agent',
        customerName: parsed.customer?.name || 'Customer',
        customerPhone: parsed.customer?.phone || '',
        phone: parsed.customer?.phone || '',
        customerId: parsed.customer?.id || log.entityId,
        indicatedToAdmin: true,
        createdAt: log.createdAt,
        readAt: null
      };
    });

    const combined = [...credentialAlerts, ...appLogs];
    res.json({ success: true, data: combined });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark as read
router.put('/:id/read', async (req, res) => {
  try {
    if (req.params.id.startsWith('agent-cred-')) {
      return res.json({ success: true, message: 'Alert acknowledged' });
    }
    await prisma.notificationLog.update({
      where: { id: req.params.id },
      data: { readAt: new Date() }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
