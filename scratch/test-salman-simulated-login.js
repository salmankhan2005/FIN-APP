const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('../backend/node_modules/bcryptjs');
const { getCustomerFilter, getLoanFilter, getUserFilter } = require('../backend/src/utils/tenant');

async function main() {
  const email = 'salmankhandwork@gmail.com';
  
  let user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    const hash = await bcrypt.hash('test1234', 10);
    user = await prisma.user.create({
      data: {
        name: 'Salman Khan',
        email: email,
        phone: email,
        passwordHash: hash,
        role: 'ADMIN',
        isActive: true,
      }
    });
  }

  const custFilter = getCustomerFilter(user);
  const loanFilter = getLoanFilter(user);

  console.log('--- Salman Initial Scoped Data ---');
  let [customers, loans, reps, payments] = await Promise.all([
    prisma.customer.findMany({ where: { isActive: true, AND: [custFilter] } }),
    prisma.loan.findMany({ where: { AND: [loanFilter] } }),
    prisma.repayment.findMany({ where: { loan: loanFilter } }),
    prisma.payment.findMany({ where: { repayment: { loan: loanFilter } } })
  ]);
  console.log('Customers count:', customers.length);
  console.log('Loans count:', loans.length);
  console.log('Repayments count:', reps.length);
  console.log('Payments count:', payments.length);

  // Now create a customer for Salman
  console.log('\n--- Adding 1 test customer for Salman ---');
  const dummyCust = await prisma.customer.create({
    data: {
      name: 'Salman Test Customer 1',
      phone: '9999900001',
      address: 'Test Address Chennai',
      city: 'Chennai',
      idType: 'AADHAR',
      idNumber: '123412341234',
      userId: user.id,
      adminId: user.id,
      creatorId: user.id,
    }
  });
  console.log('Created customer:', dummyCust.id, dummyCust.name);

  // Re-check Salman
  const updatedCusts = await prisma.customer.findMany({ where: { isActive: true, AND: [custFilter] } });
  console.log('Salman Customers count after adding 1:', updatedCusts.length);

  // Check legacy admin
  const legacyAdmin = await prisma.user.findFirst({ where: { phone: '6380372501' } });
  if (legacyAdmin) {
    const legacyCustFilter = getCustomerFilter(legacyAdmin);
    const legacyCusts = await prisma.customer.findMany({ where: { isActive: true, AND: [legacyCustFilter] } });
    console.log('Legacy Admin Customers count:', legacyCusts.length);
    const hasSalmanCustomer = legacyCusts.some(c => c.id === dummyCust.id);
    console.log('Does Legacy Admin see Salman customer?', hasSalmanCustomer ? 'YES (BUG)' : 'NO (CORRECT! FULL ISOLATION)');
  }

  // Cleanup test customer
  await prisma.customer.delete({ where: { id: dummyCust.id } });
  console.log('\nCleaned up test customer.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
