const prisma = require('./prisma');

async function migrate() {
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

  console.log('✅ Tables created and indexed successfully!');
}

migrate()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
