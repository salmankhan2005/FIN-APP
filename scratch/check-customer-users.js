const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function checkCustomers() {
  try {
    const custs = await prisma.customer.findMany({ 
      select: { id: true, name: true, userId: true, user: { select: { id: true, name: true, email: true, role: true } } } 
    });
    console.log('Customers count:', custs.length);
    custs.forEach(c => console.log('Customer:', c.name, 'userId:', c.userId, 'User:', c.user));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkCustomers();
