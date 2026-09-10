const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function testGoogleLoginDb() {
  console.log('Testing Google Login DB query...');
  try {
    const cleanEmail = 'admin@loanflow.com';
    let adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { role: 'ADMIN' }
        ]
      }
    });

    console.log('Found Admin User:', adminUser ? { id: adminUser.id, name: adminUser.name, email: adminUser.email, role: adminUser.role } : 'None');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testGoogleLoginDb();
