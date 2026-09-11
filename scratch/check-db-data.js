const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const [users, customers, loans, repayments, payments, auditLogs] = await Promise.all([
    prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, adminId: true } }),
    prisma.customer.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        loans: true
      }
    }),
    prisma.loan.findMany({
      include: {
        customer: true,
        repayments: true
      }
    }),
    prisma.repayment.findMany({ take: 20 }),
    prisma.payment.findMany({ take: 20 }),
    prisma.auditLog.count()
  ]);

  console.log('--- USERS ---');
  console.log(JSON.stringify(users, null, 2));

  console.log('--- CUSTOMERS ---');
  console.log(JSON.stringify(customers, null, 2));

  console.log('--- LOANS ---');
  console.log(JSON.stringify(loans, null, 2));

  console.log('--- REPAYMENTS ---', repayments.length);
  console.log('--- PAYMENTS ---', payments.length);
  console.log('--- AUDIT LOGS ---', auditLogs);
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
