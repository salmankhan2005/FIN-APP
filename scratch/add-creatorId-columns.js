const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const statements = [
    `ALTER TABLE "Loan" ADD COLUMN IF NOT EXISTS "creatorId" TEXT;`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "creatorId" TEXT;`,
    `ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "creatorId" TEXT;`,
    `ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "adminId" TEXT;`,
    `ALTER TABLE "Loan" ADD COLUMN IF NOT EXISTS "adminId" TEXT;`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "adminId" TEXT;`
  ];
  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log('Executed:', sql);
    } catch (e) {
      console.error('Error executing', sql, e.message);
    }
  }
}

main().finally(() => prisma.$disconnect());
