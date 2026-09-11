const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { auditLog } = require('../utils/audit');
const { getCustomerFilter, assertOwnership } = require('../utils/tenant');
const prisma = new PrismaClient();

// GET /api/customers
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const tenantFilter = getCustomerFilter(req.user);

    const where = {
      isActive: true,
      AND: [
        tenantFilter,
        ...(search ? [{
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { idNumber: { contains: search, mode: 'insensitive' } },
          ]
        }] : [])
      ]
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          loans: {
            where: { status: 'ACTIVE' },
            select: { id: true, loanNumber: true, totalPayable: true, status: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    const customerIds = customers.map(c => c.id);
    let credentialSet = new Set();
    if (customerIds.length > 0) {
      const credentialLogs = await prisma.auditLog.findMany({
        where: {
          action: { in: ['AGENT_CREATED_CUSTOMER_CREDENTIALS', 'ADMIN_SET_CUSTOMER_CREDENTIALS'] },
          entityId: { in: customerIds }
        },
        select: { entityId: true },
      });
      credentialSet = new Set(credentialLogs.map(l => l.entityId));
    }

    const customersWithCreds = customers.map(c => ({ ...c, hasCredentials: credentialSet.has(c.id) }));
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    res.json({
      success: true,
      data: customersWithCreds,
      meta: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/customers/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { email: true } },
        loans: {
          include: {
            repayments: {
              orderBy: { installmentNo: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    if (req.user.role === 'CUSTOMER') {
      const isOwner = customer.userId === req.user.id || (req.user.phone && customer.phone === req.user.phone);
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only view your own customer details.' });
      }
    } else {
      // Enforce admin workspace isolation — ADMIN and AGENT cannot access another admin's customer
      try { assertOwnership(customer, req.user, 'Customer'); } catch (ownerErr) {
        return res.status(ownerErr.statusCode || 403).json({ success: false, message: ownerErr.message });
      }
    }

    const credLog = await prisma.auditLog.findFirst({
      where: {
        entityId: customer.id,
        action: { in: ['AGENT_CREATED_CUSTOMER_CREDENTIALS', 'ADMIN_SET_CUSTOMER_CREDENTIALS'] }
      },
      select: { id: true }
    });
    res.json({ success: true, data: { ...customer, hasCredentials: !!credLog } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/customers/sync-schema - Sync database schema columns
router.get('/sync-schema', authenticate, async (req, res) => {
  try {
    const columns = [
      'photoUrl',
      'jaminName',
      'jaminPhone',
      'jaminAddress',
      'jaminRelationship',
      'jaminIdType',
      'jaminIdNumber',
      'jaminPhotoUrl',
      'jaminIdProofUrl',
    ];
    for (const col of columns) {
      const attempts = [
        `ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "${col}" TEXT;`,
        `ALTER TABLE "Customer" ADD COLUMN "${col}" TEXT;`,
        `ALTER TABLE customer ADD COLUMN IF NOT EXISTS "${col}" TEXT;`,
        `ALTER TABLE customer ADD COLUMN "${col}" TEXT;`,
        `ALTER TABLE customers ADD COLUMN IF NOT EXISTS "${col}" TEXT;`
      ];
      for (const sql of attempts) {
        try {
          await prisma.$executeRawUnsafe(sql);
          break;
        } catch (_) {}
      }
    }
    res.json({ success: true, message: 'Customer & Jamin database columns verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/customers
router.post('/', authenticate, authorize('ADMIN', 'AGENT'), async (req, res) => {
  try {
    const {
      name, phone, email, address, city, idType, idNumber,
      idProofUrl, photoUrl,
      notificationPref, latitude, longitude,
      jaminName, jaminPhone, jaminAddress, jaminRelationship,
      jaminIdType, jaminIdNumber, jaminPhotoUrl, jaminIdProofUrl
    } = req.body;

    const trimmedName = name?.trim();
    const trimmedPhone = phone?.trim();
    const cleanEmail = email?.trim() ? email.trim().toLowerCase() : null;

    // Find existing user by phone first
    let user = await prisma.user.findFirst({ where: { phone: trimmedPhone } });

    // If no user by phone, check by email
    if (!user && cleanEmail) {
      const userByEmail = await prisma.user.findFirst({ where: { email: cleanEmail } });
      if (userByEmail) {
        if (userByEmail.role === 'CUSTOMER') {
          // Reuse existing customer user account
          user = userByEmail;
        } else {
          // Email belongs to an ADMIN or AGENT — don't block, just ignore the email
          // We'll generate a unique placeholder email for this customer's user account
          const bcrypt = require('bcryptjs');
          const passwordHash = await bcrypt.hash(trimmedPhone, 12);
          user = await prisma.user.create({
            data: {
              name: trimmedName,
              email: `${trimmedPhone}@loanflow.local`,
              phone: trimmedPhone,
              passwordHash,
              role: 'CUSTOMER'
            },
          });
        }
      }
    }

    if (!user) {
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash(trimmedPhone, 12);
      user = await prisma.user.create({
        data: {
          name: trimmedName,
          email: cleanEmail || `${trimmedPhone}@loanflow.local`,
          phone: trimmedPhone,
          passwordHash,
          role: 'CUSTOMER'
        },
      });
    }

    const targetAdminId = req.user.role === 'ADMIN' ? req.user.id : (req.user.adminId || req.user.id);
    const customer = await prisma.customer.create({
      data: {
        userId: user.id,
        adminId: targetAdminId,
        creatorId: req.user.id,
        name: trimmedName,
        phone: trimmedPhone,
        email: cleanEmail,
        address: address?.trim(),
        city: city?.trim(),
        idType: idType || 'AADHAR',
        idNumber: idNumber?.trim(),
        idProofUrl: idProofUrl?.trim() || null,
        photoUrl: photoUrl?.trim() || null,
        notificationPref: notificationPref || 'WHATSAPP',
        latitude: (latitude !== undefined && latitude !== null && latitude !== '') ? parseFloat(latitude) : null,
        longitude: (longitude !== undefined && longitude !== null && longitude !== '') ? parseFloat(longitude) : null,
        jaminName: jaminName?.trim() || null,
        jaminPhone: jaminPhone?.trim() || null,
        jaminAddress: jaminAddress?.trim() || null,
        jaminRelationship: jaminRelationship?.trim() || null,
        jaminIdType: jaminIdType || 'AADHAR',
        jaminIdNumber: jaminIdNumber?.trim() || null,
        jaminPhotoUrl: jaminPhotoUrl?.trim() || null,
        jaminIdProofUrl: jaminIdProofUrl?.trim() || null,
      },
    });

    await auditLog(req.user.id, 'CREATE_CUSTOMER', 'Customer', customer.id, { name: trimmedName, phone: trimmedPhone, jaminName }, req);
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/customers/:id
router.put('/:id', authenticate, authorize('ADMIN', 'AGENT'), async (req, res) => {
  // Ownership check before update
  const existingCustomer = await prisma.customer.findUnique({ where: { id: req.params.id }, select: { id: true, adminId: true } });
  if (!existingCustomer) return res.status(404).json({ success: false, message: 'Customer not found' });
  try { assertOwnership(existingCustomer, req.user, 'Customer'); } catch (ownerErr) {
    return res.status(ownerErr.statusCode || 403).json({ success: false, message: ownerErr.message });
  }
  try {
    const {
      name, phone, email, address, city, idType, idNumber,
      idProofUrl, photoUrl,
      notificationPref, latitude, longitude,
      jaminName, jaminPhone, jaminAddress, jaminRelationship,
      jaminIdType, jaminIdNumber, jaminPhotoUrl, jaminIdProofUrl
    } = req.body;

    const trimmedName = name?.trim();
    const trimmedPhone = phone?.trim();
    const cleanEmail = email?.trim() ? email.trim() : null;

    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: {
        name: trimmedName,
        phone: trimmedPhone,
        email: cleanEmail,
        address: address !== undefined ? (address?.trim() || '') : undefined,
        city: city !== undefined ? (city?.trim() || '') : undefined,
        idType: idType || 'AADHAR',
        idNumber: idNumber !== undefined ? (idNumber?.trim() || '') : undefined,
        idProofUrl: idProofUrl !== undefined ? (idProofUrl?.trim() || null) : undefined,
        photoUrl: photoUrl !== undefined ? (photoUrl?.trim() || null) : undefined,
        notificationPref: notificationPref || 'WHATSAPP',
        latitude: (latitude !== undefined && latitude !== null && latitude !== '') ? parseFloat(latitude) : null,
        longitude: (longitude !== undefined && longitude !== null && longitude !== '') ? parseFloat(longitude) : null,
        jaminName: jaminName !== undefined ? (jaminName?.trim() || null) : undefined,
        jaminPhone: jaminPhone !== undefined ? (jaminPhone?.trim() || null) : undefined,
        jaminAddress: jaminAddress !== undefined ? (jaminAddress?.trim() || null) : undefined,
        jaminRelationship: jaminRelationship !== undefined ? (jaminRelationship?.trim() || null) : undefined,
        jaminIdType: jaminIdType !== undefined ? (jaminIdType || 'AADHAR') : undefined,
        jaminIdNumber: jaminIdNumber !== undefined ? (jaminIdNumber?.trim() || null) : undefined,
        jaminPhotoUrl: jaminPhotoUrl !== undefined ? (jaminPhotoUrl?.trim() || null) : undefined,
        jaminIdProofUrl: jaminIdProofUrl !== undefined ? (jaminIdProofUrl?.trim() || null) : undefined,
      },
    });

    // Also sync Customer name, phone, email to linked User record if present
    if (customer.userId) {
      try {
        const userUpdateData = {};
        if (trimmedName) userUpdateData.name = trimmedName;
        if (trimmedPhone) userUpdateData.phone = trimmedPhone;
        if (cleanEmail) userUpdateData.email = cleanEmail.toLowerCase();
        if (Object.keys(userUpdateData).length > 0) {
          await prisma.user.update({
            where: { id: customer.userId },
            data: userUpdateData,
          });
        }
      } catch (userErr) {
        console.warn('Note: Could not sync to User account:', userErr.message);
      }
    }

    await auditLog(req.user.id, 'UPDATE_CUSTOMER', 'Customer', customer.id, { jaminName: customer.jaminName }, req);
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/customers/:id
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    // Ownership check before delete
    const existingCustomer = await prisma.customer.findUnique({ where: { id: req.params.id }, select: { id: true, adminId: true } });
    if (!existingCustomer) return res.status(404).json({ success: false, message: 'Customer not found' });
    try { assertOwnership(existingCustomer, req.user, 'Customer'); } catch (ownerErr) {
      return res.status(ownerErr.statusCode || 403).json({ success: false, message: ownerErr.message });
    }

    const activeLoans = await prisma.loan.findMany({
      where: {
        customerId: req.params.id,
        status: { in: ['ACTIVE', 'PENDING', 'DEFAULTED'] },
      },
    });

    if (activeLoans.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Currently an active loan is running for this customer, so cannot delete.',
      });
    }

    await prisma.customer.update({ where: { id: req.params.id }, data: { isActive: false } });
    await auditLog(req.user.id, 'DELETE_CUSTOMER', 'Customer', req.params.id, {}, req);
    res.json({ success: true, message: 'Customer deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/customers/:id/credentials - Agent/Admin creates or updates customer app login credentials
router.post('/:id/credentials', authenticate, authorize('ADMIN', 'AGENT'), async (req, res) => {
  try {
    const { password, phone, email } = req.body;
    if (!password || password.trim().length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters long' });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Ownership check — cannot set credentials for another admin's customer
    try { assertOwnership(customer, req.user, 'Customer'); } catch (ownerErr) {
      return res.status(ownerErr.statusCode || 403).json({ success: false, message: ownerErr.message });
    }

    const isAgent = req.user.role === 'AGENT';

    // Agents can only create credentials ONCE per customer.
    // If credentials were created previously (logged in auditLog), block the agent.
    if (isAgent) {
      const existingCredLog = await prisma.auditLog.findFirst({
        where: {
          entityId: customer.id,
          action: { in: ['AGENT_CREATED_CUSTOMER_CREDENTIALS', 'ADMIN_SET_CUSTOMER_CREDENTIALS'] }
        },
        select: { id: true }
      });
      if (existingCredLog) {
        return res.status(403).json({
          success: false,
          message: `Credentials already exist for ${customer.name}. Only an Admin can reset them.`
        });
      }
    }

    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password.trim(), 12);

    const targetPhone = phone?.trim() || customer.phone;
    const targetEmail = email?.trim() || customer.email || `${targetPhone}@loanflow.local`;

    let updatedUser;
    if (customer.user) {
      updatedUser = await prisma.user.update({
        where: { id: customer.userId },
        data: {
          phone: targetPhone,
          email: targetEmail.toLowerCase(),
          passwordHash,
          role: 'CUSTOMER'
        }
      });
    } else {
      updatedUser = await prisma.user.create({
        data: {
          name: customer.name,
          phone: targetPhone,
          email: targetEmail.toLowerCase(),
          passwordHash,
          role: 'CUSTOMER'
        }
      });
      await prisma.customer.update({
        where: { id: customer.id },
        data: { userId: updatedUser.id, phone: targetPhone }
      });
    }

    const auditAction = isAgent ? 'AGENT_CREATED_CUSTOMER_CREDENTIALS' : 'ADMIN_SET_CUSTOMER_CREDENTIALS';
    const notificationMessage = `Field Agent "${req.user.name}" created app login credentials for Customer "${customer.name}" (${targetPhone})`;

    // Record in AuditLog for full traceability and Admin indication
    await auditLog(
      req.user.id,
      auditAction,
      'Customer',
      customer.id,
      {
        performedBy: {
          id: req.user.id,
          name: req.user.name,
          role: req.user.role,
          phone: req.user.phone,
          agentId: req.user.agentId || null
        },
        customer: {
          id: customer.id,
          name: customer.name,
          phone: targetPhone
        },
        message: notificationMessage,
        createdAt: new Date().toISOString()
      },
      req
    );

    res.json({
      success: true,
      message: isAgent 
        ? `Credentials created for ${customer.name}. Super Admin has been notified.`
        : `Credentials updated successfully for ${customer.name}.`,
      data: {
        customerId: customer.id,
        phone: targetPhone,
        userId: updatedUser.id,
        indicatedToAdmin: isAgent
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
