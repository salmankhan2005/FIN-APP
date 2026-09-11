const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, email: true, name: true, phone: true, createdAt: true }
  });
  console.log('--- ADMIN USERS ---');
  console.log(JSON.stringify(users, null, 2));

  const customers = await prisma.customer.findMany({
    select: { id: true, name: true, adminId: true, creatorId: true }
  });
  console.log('--- CUSTOMERS COUNT:', customers.length);
  console.log(JSON.stringify(customers.slice(0, 5), null, 2));
}

run().catch(console.error).finally(() => prisma.$disconnect());
