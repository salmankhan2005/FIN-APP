require('dotenv').config(); // trigger restart
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 5000;

// Resolve local network IP address dynamically
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const interfaceName in interfaces) {
    for (const iface of interfaces[interfaceName]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}
const localIp = getLocalIpAddress();

// ─── Middleware ────────────────────────────────────────────────────────────────

// Trust reverse proxy (Render, Vercel, Railway, Nginx) for accurate client IP rate limiting
app.set('trust proxy', 1);

app.use(helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

// Allow specific origins for production security
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
  skip: (req) => process.env.DISABLE_RATE_LIMIT === 'true',
});
app.use('/api/', limiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use(['/api/auth', '/auth'], require('./src/routes/auth'));
app.use('/api/users',      require('./src/routes/users'));
app.use('/api/customers',  require('./src/routes/customers'));
app.use('/api/loans',      require('./src/routes/loans'));
app.use('/api/repayments', require('./src/routes/repayments'));
app.use('/api/payments',   require('./src/routes/payments'));
app.use('/api/dashboard',  require('./src/routes/dashboard'));
app.use('/api/reports',    require('./src/routes/reports'));
app.use('/api/audit',      require('./src/routes/audit'));
app.use('/api/notifications', require('./src/routes/notifications'));
app.use('/api/settlements',   require('./src/routes/settlements'));
app.use('/api/daybook',       require('./src/routes/daybook'));

// Health check
app.get(['/health', '/api/health'], (req, res) => res.json({
  status: 'ok',
  app: process.env.APP_NAME || 'Finova',
  version: '2.4.0-settlements-daybook',
  timestamp: new Date().toISOString()
}));

// Safe database schema synchronizer route
app.get('/api/sync-db', async (req, res) => {
  try {
    await syncDatabaseSchema();
    res.json({
      success: true,
      message: 'Customer & Jamin database columns synchronized successfully',
      version: '2.2.0-customer-jamin-edit',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const { seedAdmin } = require('./src/utils/seed');
const { startCronJobs } = require('./src/jobs/cron');
const prisma = require('./src/utils/prisma');

async function syncDatabaseSchema() {
  try {
    // ── User table missing columns ────────────────────────────────────────────
    const userCols = [
      { col: 'agentId',   type: 'TEXT' },
      { col: 'adminId',   type: 'TEXT' },
      { col: 'creatorId', type: 'TEXT' },
    ];
    for (const item of userCols) {
      try {
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "${item.col}" ${item.type};`
        );
      } catch (_) {}
    }
    // Ensure indexes exist on User
    try { await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "User_adminId_idx" ON "User"("adminId");`); } catch (_) {}
    try { await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "User_role_idx"    ON "User"("role");`); } catch (_) {}
    console.log('✅ User schema columns verified');

    // ── Customer table missing columns ────────────────────────────────────────
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
    // Customer adminId / creatorId
    for (const col of ['adminId', 'creatorId']) {
      try { await prisma.$executeRawUnsafe(`ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "${col}" TEXT;`); } catch (_) {}
    }
    // Customer GPS
    for (const item of [{ col: 'latitude', type: 'DOUBLE PRECISION' }, { col: 'longitude', type: 'DOUBLE PRECISION' }]) {
      try { await prisma.$executeRawUnsafe(`ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "${item.col}" ${item.type};`); } catch (_) {}
    }
    // Customer notificationPref
    try { await prisma.$executeRawUnsafe(`ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "notificationPref" TEXT DEFAULT 'BOTH';`); } catch (_) {}
    console.log('✅ Customer & Jamin schema columns verified');

    // Repayment table schema updates for Weekly & Daily Carry-Forward
    const repaymentCols = [
      { col: 'weekNo', type: 'INTEGER' },
      { col: 'dayNo', type: 'INTEGER' },
      { col: 'penaltyAmount', type: 'DOUBLE PRECISION DEFAULT 0' },
      { col: 'penaltyPaid', type: 'DOUBLE PRECISION DEFAULT 0' },
      { col: 'penaltyStatus', type: "TEXT DEFAULT 'NONE'" },
      { col: 'originalDueDate', type: 'TIMESTAMP' },
      { col: 'carriedToInstNo', type: 'INTEGER' }
    ];

    for (const item of repaymentCols) {
      const attempts = [
        `ALTER TABLE "Repayment" ADD COLUMN IF NOT EXISTS "${item.col}" ${item.type};`,
        `ALTER TABLE "Repayment" ADD COLUMN "${item.col}" ${item.type};`,
        `ALTER TABLE repayment ADD COLUMN IF NOT EXISTS "${item.col}" ${item.type};`,
        `ALTER TABLE repayments ADD COLUMN IF NOT EXISTS "${item.col}" ${item.type};`
      ];
      for (const sql of attempts) {
        try {
          await prisma.$executeRawUnsafe(sql);
          break;
        } catch (_) {}
      }
    }
    console.log('✅ Repayment carry-forward columns verified');

    // ── Loan table missing columns ────────────────────────────────────────────
    const loanCols = [
      { col: 'adminId',              type: 'TEXT' },
      { col: 'creatorId',            type: 'TEXT' },
      { col: 'interestCollected',    type: 'DOUBLE PRECISION DEFAULT 0' },
      { col: 'outstandingPrincipal', type: 'DOUBLE PRECISION' },
    ];
    for (const item of loanCols) {
      try { await prisma.$executeRawUnsafe(`ALTER TABLE "Loan" ADD COLUMN IF NOT EXISTS "${item.col}" ${item.type};`); } catch (_) {}
    }
    // High-performance database query indexes
    try {
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Loan_adminId_idx" ON "Loan"("adminId");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Loan_adminId_status_idx" ON "Loan"("adminId", "status");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Loan_customerId_status_idx" ON "Loan"("customerId", "status");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Loan_createdAt_idx" ON "Loan"("createdAt");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Repayment_loanId_idx" ON "Repayment"("loanId");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Repayment_loanId_status_idx" ON "Repayment"("loanId", "status");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Repayment_dueDate_idx" ON "Repayment"("dueDate");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Repayment_dueDate_status_idx" ON "Repayment"("dueDate", "status");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Payment_repaymentId_idx" ON "Payment"("repaymentId");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Payment_collectedAt_idx" ON "Payment"("collectedAt");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Customer_adminId_isActive_idx" ON "Customer"("adminId", "isActive");`);
    } catch (_) {}
    console.log('✅ Loan schema & performance indices verified');

    // ── CashSettlement, Expense & DayBookOpeningBalance tables ──────────────
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "CashSettlement" (
          "id" TEXT PRIMARY KEY,
          "adminId" TEXT NOT NULL,
          "agentId" TEXT NOT NULL,
          "settlementDate" TIMESTAMP(3) NOT NULL,
          "totalCollected" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "collectionCount" INTEGER NOT NULL DEFAULT 0,
          "fuelExpense" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "commission" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "otherDeductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "expectedCash" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "actualCashReceived" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "difference" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "status" TEXT NOT NULL DEFAULT 'PENDING',
          "verifiedById" TEXT,
          "signOffOtp" TEXT,
          "notes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "CashSettlement_adminId_idx" ON "CashSettlement"("adminId");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "CashSettlement_adminId_settlementDate_idx" ON "CashSettlement"("adminId", "settlementDate");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "CashSettlement_agentId_settlementDate_idx" ON "CashSettlement"("agentId", "settlementDate");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "CashSettlement_status_idx" ON "CashSettlement"("status");`);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Expense" (
          "id" TEXT PRIMARY KEY,
          "adminId" TEXT NOT NULL,
          "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "category" TEXT NOT NULL,
          "amount" DOUBLE PRECISION NOT NULL,
          "description" TEXT NOT NULL,
          "paymentMode" TEXT NOT NULL DEFAULT 'CASH',
          "createdById" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Expense_adminId_idx" ON "Expense"("adminId");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Expense_adminId_date_idx" ON "Expense"("adminId", "date");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Expense_category_idx" ON "Expense"("category");`);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "DayBookOpeningBalance" (
          "id" TEXT PRIMARY KEY,
          "adminId" TEXT NOT NULL,
          "date" TIMESTAMP(3) NOT NULL,
          "openingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "notes" TEXT,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "DayBookOpeningBalance_adminId_date_key" ON "DayBookOpeningBalance"("adminId", "date");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "DayBookOpeningBalance_adminId_idx" ON "DayBookOpeningBalance"("adminId");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "DayBookOpeningBalance_date_idx" ON "DayBookOpeningBalance"("date");`);
      console.log('✅ CashSettlement, Expense & DayBook tables verified');
    } catch (tblErr) {
      console.warn('⚠️ Table verification note:', tblErr.message);
    }

    // ── Workspace isolation: link legacy unassigned records & deduplicate admin accounts
    try {
      const logs = await prisma.auditLog.findMany({
        where: { action: { in: ['CREATE_CUSTOMER', 'CREATE_LOAN'] } }
      });
      for (const log of logs) {
        if (log.action === 'CREATE_CUSTOMER' && log.entityId && log.userId) {
          await prisma.customer.updateMany({
            where: { id: log.entityId, adminId: null },
            data: { adminId: log.userId, creatorId: log.userId }
          });
        }
        if (log.action === 'CREATE_LOAN' && log.entityId && log.userId) {
          await prisma.loan.updateMany({
            where: { id: log.entityId, adminId: null },
            data: { adminId: log.userId, creatorId: log.userId }
          });
        }
      }

      const allAdmins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        orderBy: { createdAt: 'asc' }
      });
      const byKey = {};
      for (const u of allAdmins) {
        const key = (u.email || u.phone || '').toLowerCase().trim();
        if (!key) continue;
        if (!byKey[key]) byKey[key] = [];
        byKey[key].push(u);
      }
      for (const [, accounts] of Object.entries(byKey)) {
        if (accounts.length > 1) {
          const primary = accounts[0];
          const dupIds = accounts.slice(1).map(a => a.id);
          await prisma.customer.updateMany({ where: { adminId: { in: dupIds } }, data: { adminId: primary.id } });
          await prisma.customer.updateMany({ where: { creatorId: { in: dupIds } }, data: { creatorId: primary.id } });
          await prisma.loan.updateMany({ where: { adminId: { in: dupIds } }, data: { adminId: primary.id } });
          await prisma.loan.updateMany({ where: { creatorId: { in: dupIds } }, data: { creatorId: primary.id } });
          await prisma.auditLog.updateMany({ where: { userId: { in: dupIds } }, data: { userId: primary.id } });
          await prisma.refreshToken.updateMany({ where: { userId: { in: dupIds } }, data: { userId: primary.id } });
          await prisma.user.deleteMany({ where: { id: { in: dupIds } } });
        }
      }

      const loansWithoutAdmin = await prisma.loan.findMany({
        where: { adminId: null },
        include: { customer: true }
      });
      for (const l of loansWithoutAdmin) {
        if (l.customer?.adminId) {
          await prisma.loan.update({
            where: { id: l.id },
            data: { adminId: l.customer.adminId, creatorId: l.customer.creatorId }
          });
        }
      }
      console.log('✅ Admin workspace isolation synced');
    } catch (isoErr) {
      console.warn('⚠️ Workspace isolation sync note:', isoErr.message);
    }
  } catch (err) {
    console.warn('⚠️ Schema check note:', err.message);
  }
}

async function start() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    await syncDatabaseSchema();
    await seedAdmin();
    startCronJobs();
    app.listen(PORT, () => {
      console.log(`🚀 Finova API running on port ${PORT}`);
      console.log(`📡 Localhost: http://localhost:${PORT}`);
      console.log(`📡 Network: http://${localIp}:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();
