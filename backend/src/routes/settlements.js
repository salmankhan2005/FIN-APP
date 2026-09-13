const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { auditLog } = require('../utils/audit');
const { getLoanFilter } = require('../utils/tenant');

const round2 = (num) => Math.round((Number(num) || 0) * 100) / 100;

// GET /api/settlements/summary — Live cash reconciliation summary for an agent
router.get('/summary', authenticate, authorize('ADMIN', 'AGENT'), async (req, res) => {
  try {
    const { agentId, date } = req.query;
    const targetAgentId = req.user.role === 'AGENT' ? req.user.id : agentId;

    if (!targetAgentId) {
      return res.status(400).json({ success: false, message: 'agentId query parameter is required' });
    }

    const adminId = req.user.role === 'ADMIN' ? req.user.id : (req.user.adminId || req.user.id);
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0);
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    const [agentUser, cashAgg, existingSettlement] = await Promise.all([
      prisma.user.findUnique({
        where: { id: targetAgentId },
        select: { id: true, name: true, phone: true, email: true, agentId: true, role: true }
      }),
      prisma.payment.aggregate({
        where: {
          collectedById: targetAgentId,
          paymentMode: 'CASH',
          collectedAt: { gte: startOfDay, lte: endOfDay },
          repayment: { loan: getLoanFilter(req.user) }
        },
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.cashSettlement.findFirst({
        where: {
          adminId,
          agentId: targetAgentId,
          settlementDate: { gte: startOfDay, lte: endOfDay }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    if (!agentUser) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    const totalCollected = round2(cashAgg._sum.amount || 0);
    const collectionCount = cashAgg._count.id || 0;

    res.json({
      success: true,
      data: {
        agent: agentUser,
        date: startOfDay.toISOString().split('T')[0],
        totalCollected,
        collectionCount,
        settlement: existingSettlement || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/settlements/reconcile — Admin verifies physical cash, logs expenses & locks day
router.post('/reconcile', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const {
      agentId,
      date,
      fuelExpense = 0,
      commission = 0,
      otherDeductions = 0,
      actualCashReceived = 0,
      signOffOtp,
      notes = '',
      lockBatch = false
    } = req.body;

    if (!agentId) {
      return res.status(400).json({ success: false, message: 'agentId is required' });
    }

    const adminId = req.user.id;
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0);
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    // Fast indexed sum of today's cash collections
    const cashAgg = await prisma.payment.aggregate({
      where: {
        collectedById: agentId,
        paymentMode: 'CASH',
        collectedAt: { gte: startOfDay, lte: endOfDay },
        repayment: { loan: getLoanFilter(req.user) }
      },
      _sum: { amount: true },
      _count: { id: true }
    });

    const totalCollected = round2(cashAgg._sum.amount || 0);
    const collectionCount = cashAgg._count.id || 0;

    const fuel = round2(fuelExpense);
    const comm = round2(commission);
    const other = round2(otherDeductions);
    const expectedCash = round2(totalCollected - fuel - comm - other);
    const actualReceived = round2(actualCashReceived);
    const difference = round2(actualReceived - expectedCash);

    const status = lockBatch ? 'LOCKED' : 'VERIFIED';

    // Find existing settlement for this agent today
    const existing = await prisma.cashSettlement.findFirst({
      where: {
        adminId,
        agentId,
        settlementDate: { gte: startOfDay, lte: endOfDay }
      }
    });

    let settlement;
    if (existing) {
      settlement = await prisma.cashSettlement.update({
        where: { id: existing.id },
        data: {
          totalCollected,
          collectionCount,
          fuelExpense: fuel,
          commission: comm,
          otherDeductions: other,
          expectedCash,
          actualCashReceived: actualReceived,
          difference,
          status,
          verifiedById: req.user.id,
          signOffOtp: signOffOtp || existing.signOffOtp,
          notes,
          updatedAt: new Date()
        }
      });
    } else {
      settlement = await prisma.cashSettlement.create({
        data: {
          adminId,
          agentId,
          settlementDate: startOfDay,
          totalCollected,
          collectionCount,
          fuelExpense: fuel,
          commission: comm,
          otherDeductions: other,
          expectedCash,
          actualCashReceived: actualReceived,
          difference,
          status,
          verifiedById: req.user.id,
          signOffOtp: signOffOtp || null,
          notes
        }
      });
    }

    // Auto-record fuel expense into DayBook if claimed and > 0
    if (fuel > 0) {
      await prisma.expense.create({
        data: {
          adminId,
          date: startOfDay,
          category: 'PETROL',
          amount: fuel,
          description: `Agent Fuel Allowance (${settlement.id.slice(0, 8)})`,
          paymentMode: 'CASH',
          createdById: req.user.id
        }
      }).catch(err => console.warn('Auto-expense note:', err.message));
    }

    await auditLog(req.user.id, 'CASH_SETTLEMENT_RECONCILED', 'CashSettlement', settlement.id, {
      agentId,
      totalCollected,
      expectedCash,
      actualCashReceived: actualReceived,
      difference,
      status
    }, req);

    res.json({
      success: true,
      message: lockBatch ? '✓ Settlement verified and locked for the day!' : '✓ Cash settlement updated successfully',
      data: settlement
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/settlements/history — History of day-close settlements
router.get('/history', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { agentId, from, to, page = 1, limit = 20 } = req.query;
    const adminId = req.user.id;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { adminId };
    if (agentId) where.agentId = agentId;
    if (from || to) {
      where.settlementDate = {};
      if (from) where.settlementDate.gte = new Date(from);
      if (to) where.settlementDate.lte = new Date(to);
    }

    const [settlements, total] = await Promise.all([
      prisma.cashSettlement.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          agent: { select: { id: true, name: true, phone: true, agentId: true } }
        },
        orderBy: { settlementDate: 'desc' }
      }),
      prisma.cashSettlement.count({ where })
    ]);

    res.json({
      success: true,
      data: settlements,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
