const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function addAdminIdCols() {
  const queries = [
    `ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "adminId" TEXT;`,
    `ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "creatorId" TEXT;`,
    `ALTER TABLE "Loan" ADD COLUMN IF NOT EXISTS "adminId" TEXT;`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "adminId" TEXT;`
  ];
  for (const q of queries) {
    try {
      await prisma.$executeRawUnsafe(q);
      console.log('✅ Executed:', q);
    } catch (e) {
      console.error('❌ Error:', q, e.message);
    }
  }
  await prisma.$disconnect();
}

addAdminIdCols();
