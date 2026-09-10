const { PrismaClient } = require('../backend/node_modules/@prisma/client');
const prisma = new PrismaClient();
const { getCustomerFilter, getLoanFilter, getUserFilter } = require('../backend/src/utils/tenant');

async function main() {
  const salman = await prisma.user.findFirst({
    where: { email: 'salmankhandwork@gmail.com' }
  });

  console.log('Salman User:', salman);

  if (!salman) {
    console.log('Salman user not found in DB!');
    return;
  }

  const customerFilter = getCustomerFilter(salman);
  const loanFilter = getLoanFilter(salman);
  const userFilter = getUserFilter(salman);

  console.log('\n--- CUSTOMER FILTER ---');
  console.log(JSON.stringify(customerFilter, null, 2));
  const customers = await prisma.customer.findMany({
    where: { isActive: true, AND: [customerFilter] }
  });
  console.log('Salman Customers Count:', customers.length);

  console.log('\n--- LOAN FILTER ---');
  console.log(JSON.stringify(loanFilter, null, 2));
  const loans = await prisma.loan.findMany({
    where: { AND: [loanFilter] }
  });
  console.log('Salman Loans Count:', loans.length);

  console.log('\n--- REPAYMENTS ---');
  const repayments = await prisma.repayment.findMany({
    where: { loan: loanFilter }
  });
  console.log('Salman Repayments Count:', repayments.length);

  console.log('\n--- PAYMENTS ---');
  const payments = await prisma.payment.findMany({
    where: { repayment: { loan: loanFilter } }
  });
  console.log('Salman Payments Count:', payments.length);

  // Compare with legacy admin
  const legacyAdmin = await prisma.user.findFirst({
    where: { phone: '6380372501' }
  });
  if (legacyAdmin) {
    console.log('\n=======================================');
    console.log('Legacy Admin User:', legacyAdmin.phone, legacyAdmin.email);
    const legacyCustomerFilter = getCustomerFilter(legacyAdmin);
    const legacyLoanFilter = getLoanFilter(legacyAdmin);
    
    const legacyCustomers = await prisma.customer.findMany({
      where: { isActive: true, AND: [legacyCustomerFilter] }
    });
    console.log('Legacy Admin Customers Count:', legacyCustomers.length);

    const legacyLoans = await prisma.loan.findMany({
      where: { AND: [legacyLoanFilter] }
    });
    console.log('Legacy Admin Loans Count:', legacyLoans.length);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
