const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const { syncOverdueStatus } = require('../utils/loanCalc');
const { getLoanFilter } = require('../utils/tenant');
const prisma = new PrismaClient();

const round2 = (n) => Math.round(n * 100) / 100;

function getBatchSize(tenureUnit) {
  if (tenureUnit === 'WEEKS') return 52;
  if (tenureUnit === 'MONTHS') return 12;
  return 365;
}

/**
 * Auto-extend installments for active loans that are running low.
 */
async function autoExtendActiveLoans(loanFilter = null) {
  const where = { status: 'ACTIVE' };
  if (loanFilter) {
    where.AND = [loanFilter];
  }
  const activeLoans = await prisma.loan.findMany({
    where,
    select: { id: true, principalAmount: true, outstandingPrincipal: true, interestRate: true, tenureUnit: true },
  });

  for (const loan of activeLoans) {
    const unpaidCount = await prisma.repayment.count({
      where: { loanId: loan.id, status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] } },
    });

    if (unpaidCount >= 4) continue;

    const lastInstallment = await prisma.repayment.findFirst({
      where: { loanId: loan.id },
      orderBy: { installmentNo: 'desc' },
    });

    if (!lastInstallment) continue;

    const currentPrincipal = loan.outstandingPrincipal ?? loan.principalAmount;
    const interestPerPeriod = round2(currentPrincipal * (loan.interestRate / 100));
    const batchSize = getBatchSize(loan.tenureUnit);
    const startNo = lastInstallment.installmentNo + 1;
    const startFrom = new Date(lastInstallment.dueDate);

    const installments = [];
    for (let i = 0; i < batchSize; i++) {
      const dueDate = new Date(startFrom);
      const offset = i + 1;
      if (loan.tenureUnit === 'MONTHS') dueDate.setMonth(dueDate.getMonth() + offset);
      else if (loan.tenureUnit === 'WEEKS') dueDate.setDate(dueDate.getDate() + offset * 7);
      else dueDate.setDate(dueDate.getDate() + offset);

      installments.push({
        loanId: loan.id,
        installmentNo: startNo + i,
        dueDate,
        dueAmount: interestPerPeriod,
        principal: 0,
        interest: interestPerPeriod,
        status: 'PENDING',
      });
    }

    await prisma.repayment.createMany({ data: installments });

    const newEndDate = installments[installments.length - 1].dueDate;
    await prisma.loan.update({
      where: { id: loan.id },
      data: {
        tenure: startNo + batchSize - 1,
        endDate: newEndDate,
      },
    });
  }
}

// GET /api/repayments — list with filters
router.get('/', authenticate, async (req, res) => {
  try {
    const { loanId, status, from, to, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const loanFilter = getLoanFilter(req.user);

    const andConditions = [
      { loan: loanFilter }
    ];

    if (loanId) andConditions.push({ loanId });
    if (status === 'OVERDUE') {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      andConditions.push({
        OR: [
          { status: 'OVERDUE' },
          { dueDate: { lt: startOfToday }, status: { in: ['PENDING', 'PARTIAL'] } }
        ]
      });
    } else if (status) {
      andConditions.push({ status });
    }

    if (from || to) {
      const dateCond = {};
      if (from) dateCond.gte = new Date(from);
      if (to) dateCond.lte = new Date(to);
      andConditions.push({ dueDate: dateCond });
    }

    const where = { AND: andConditions };

    syncOverdueStatus(prisma).catch(err => console.error('syncOverdueStatus error:', err));
    autoExtendActiveLoans(loanFilter).catch(err => console.error('autoExtend error:', err));

    const [repayments, total] = await Promise.all([
      prisma.repayment.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          loan: { select: { loanNumber: true, interestType: true, customer: { select: { name: true, phone: true, latitude: true, longitude: true } } } },
          payments: { include: { collectedBy: { select: { name: true } } } },
        },
        orderBy: { dueDate: 'asc' },
      }),
      prisma.repayment.count({ where }),
    ]);

    res.json({ success: true, data: repayments, meta: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/repayments/today — Today's collections
router.get('/today', authenticate, async (req, res) => {
  try {
    const loanFilter = getLoanFilter(req.user);

    syncOverdueStatus(prisma).catch(err => console.error('syncOverdueStatus error:', err));
    autoExtendActiveLoans(loanFilter).catch(err => console.error('autoExtend error:', err));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const where = {
      loan: loanFilter,
      OR: [
        { dueDate: { gte: today, lt: tomorrow } },
        { payments: { some: { collectedAt: { gte: today, lt: tomorrow } } } },
        { paidAt: { gte: today, lt: tomorrow } },
      ]
    };

    const repayments = await prisma.repayment.findMany({
      where,
      include: {
        loan: {
          select: {
            loanNumber: true,
            interestType: true,
            agentId: true,
            customer: { select: { name: true, phone: true, address: true, latitude: true, longitude: true } },
          },
        },
        payments: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    res.json({ success: true, data: repayments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
