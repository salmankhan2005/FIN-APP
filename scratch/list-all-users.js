const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Total Users:', users.length);
  users.forEach(u => console.log(u.id, u.email, u.phone, u.role));
}

main().finally(() => prisma.$disconnect());
