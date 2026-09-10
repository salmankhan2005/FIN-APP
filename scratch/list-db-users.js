const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log('Total Users in DB:', users.length);
    for (const u of users) {
      console.log('USER:', { id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, agentId: u.agentId });
    }
  } catch (err) {
    console.error('DB Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
