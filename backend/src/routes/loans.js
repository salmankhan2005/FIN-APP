const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { auditLog } = require('../utils/audit');
const { generateLoanNumber, syncOverdueStatus } = require('../utils/loanCalc');
const { getLoanFilter, assertOwnership } = require('../utils/tenant');

const round2 = (n) => Math.round(n * 100) / 100;

/**
 * Get the initial batch size for a tenure unit.
 * This is how many installments we generate at a time.
 */
function getBatchSize(tenureUnit) {
  if (tenureUnit === 'WEEKS') return 52;
  if (tenureUnit === 'MONTHS') return 12;
  if (tenureUnit === 'YEARS') return 5;
  return 365; // DAYS
}

/**
 * Generate installment records with weekly/daily schedule metadata.
 * @param {string} loanId
 * @param {number} principalPerPeriod
 * @param {number} interestPerPeriod
 * @param {string} tenureUnit - DAYS | WEEKS | MONTHS | YEARS
 * @param {Date} startFrom - starting date
 * @param {number} startNo - starting installment number
 * @param {number} count - number of installments
 * @param {string} frequency - DAILY | WEEKLY | MONTHLY | YEARLY
 */
function generateInstallments(loanId, principalPerPeriod, interestPerPeriod, tenureUnit, startFrom, startNo, count, frequency = null) {
  const installments = [];
  const isDaily = frequency === 'DAILY' || tenureUnit === 'DAYS';
  const isWeekly = frequency === 'WEEKLY' || (!frequency && tenureUnit === 'WEEKS');
  const isYearly = frequency === 'YEARLY' || (!frequency && tenureUnit === 'YEARS');

  for (let i = 0; i < count; i++) {
    const dueDate = new Date(startFrom);
    const offset = (startNo === 1) ? i : (i + 1);

    let weekNo, dayNo;
    if (isDaily) {
      dueDate.setDate(dueDate.getDate() + offset);
      const absIndex = (startNo - 1) + i;
      weekNo = Math.floor(absIndex / 7) + 1;
      dayNo = (absIndex % 7) + 1;
    } else if (isWeekly) {
      dueDate.setDate(dueDate.getDate() + offset * 7);
      weekNo = (startNo - 1) + i + 1;
      dayNo = 1;
    } else if (isYearly) {
      dueDate.setFullYear(dueDate.getFullYear() + offset);
      weekNo = (startNo - 1) + i + 1;
      dayNo = 1;
    } else {
      dueDate.setMonth(dueDate.getMonth() + offset);
      weekNo = (startNo - 1) + i + 1;
      dayNo = 1;
    }

    let prin = round2(principalPerPeriod);
    let intst = round2(interestPerPeriod);
    let due = round2(prin + intst);

    installments.push({
      loanId,
      installmentNo: startNo + i,
      weekNo,
      dayNo,
      dueDate,
      originalDueDate: dueDate,
      dueAmount: due,
      principal: prin,
      interest: intst,
      penaltyAmount: 0,
      penaltyPaid: 0,
      penaltyStatus: 'NONE',
      status: 'PENDING',
    });
  }
  return installments;
}

/**
 * Auto-extend a loan's installments if most existing ones are paid/used.
 * Generates another batch when unpaid installments fall below a threshold.
 */
async function autoExtendIfNeeded(loanId) {
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan || loan.status !== 'ACTIVE') return;
  if (loan.interestType === 'WITHOUT_INTEREST' || loan.interestType === 'EMI') return; // Fixed tenure, no auto-extend

  // Count unpaid installments
  const unpaidCount = await prisma.repayment.count({
    where: { loanId, status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] } },
  });

  // Threshold: extend when fewer than 4 unpaid installments remain
  const threshold = 4;
  if (unpaidCount >= threshold) return;

  // Get the last installment to know where to continue from
  const lastInstallment = await prisma.repayment.findFirst({
    where: { loanId },
    orderBy: { installmentNo: 'desc' },
  });

  if (!lastInstallment) return;

  const currentPrincipal = loan.outstandingPrincipal ?? loan.principalAmount;
  const interestPerPeriod = currentPrincipal * (loan.interestRate / 100);
  const batchSize = getBatchSize(loan.tenureUnit);
  const startNo = lastInstallment.installmentNo + 1;
  const startFrom = new Date(lastInstallment.dueDate);

  const newInstallments = generateInstallments(
    loanId, 0, interestPerPeriod, loan.tenureUnit, startFrom, startNo, batchSize
  );

  await prisma.repayment.createMany({ data: newInstallments });

  // Update loan tenure count and end date
  const newEndDate = newInstallments[newInstallments.length - 1].dueDate;
  await prisma.loan.update({
    where: { id: loanId },
    data: {
      tenure: startNo + batchSize - 1,
      endDate: newEndDate,
      totalInterest: round2(interestPerPeriod * (startNo + batchSize - 1)),
      totalPayable: round2(currentPrincipal + interestPerPeriod * (startNo + batchSize - 1)),
    },
  });
}

// GET /api/loans
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, customerId, agentId, search, tenureUnit, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const tenantFilter = getLoanFilter(req.user);
    const andConditions = [tenantFilter];

    if (status) andConditions.push({ status });
    if (customerId) andConditions.push({ customerId });
    if (agentId) andConditions.push({ agentId });
    if (tenureUnit) andConditions.push({ tenureUnit });
    
    if (search) {
      andConditions.push({
        OR: [
          { loanNumber: { contains: search, mode: 'insensitive' } },
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          { customer: { phone: { contains: search, mode: 'insensitive' } } },
        ]
      });
    }
    
    const where = { AND: andConditions };

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          agent: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.loan.count({ where }),
    ]);

    // Efficiently compute repaymentProgress for each loan on this page
    // using two grouped count queries (no N+1).
    const loanIds = loans.map(l => l.id);
    let progressMap = {};
    if (loanIds.length > 0) {
      const [paidCounts, totalCounts] = await Promise.all([
        prisma.repayment.groupBy({
          by: ['loanId'],
          where: { loanId: { in: loanIds }, status: 'PAID' },
          _count: { id: true },
        }),
        prisma.repayment.groupBy({
          by: ['loanId'],
          where: { loanId: { in: loanIds } },
          _count: { id: true },
        }),
      ]);
      const paidMap = Object.fromEntries(paidCounts.map(r => [r.loanId, r._count.id]));
      const totMap  = Object.fromEntries(totalCounts.map(r => [r.loanId, r._count.id]));
      progressMap = Object.fromEntries(loanIds.map(id => [
        id,
        totMap[id] ? Math.round(((paidMap[id] || 0) / totMap[id]) * 100) : 0
      ]));
    }

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    res.json({
      success: true,
      data: loans.map(l => ({ ...l, repaymentProgress: progressMap[l.id] ?? 0 })),
      meta: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// GET /api/loans/:id/preclosure
router.get('/:id/preclosure', authenticate, async (req, res) => {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id: req.params.id },
      include: { repayments: { include: { payments: true } } }
    });
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
    if (loan.status === 'CLOSED') return res.status(400).json({ success: false, message: 'Loan is already closed' });

    let principalOutstanding = loan.outstandingPrincipal ?? loan.principalAmount;
    let accruedInterest = 0;
    let unpaidPeriods = 0;
    let tenureUnitStr = loan.tenureUnit === 'MONTHS' ? 'Months' : loan.tenureUnit === 'WEEKS' ? 'Weeks' : 'Days';

    if (loan.interestType === 'FLAT') {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const start = new Date(loan.startDate);
      
      const diffTime = Math.max(0, today - start);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // Calculate daily interest rate
      let dailyInterest = 0;
      const rate = loan.interestRate / 100;
      if (loan.tenureUnit === 'MONTHS') dailyInterest = (principalOutstanding * rate) / 30;
      else if (loan.tenureUnit === 'WEEKS') dailyInterest = (principalOutstanding * rate) / 7;
      else dailyInterest = (principalOutstanding * rate);

      const totalAccrued = dailyInterest * diffDays;
      
      // Total interest paid so far
      const totalInterestPaid = loan.repayments.reduce((acc, r) => {
        const intPayments = r.payments.filter(p => p.paymentType === 'INTEREST').reduce((s, p) => s + p.amount, 0);
        return acc + intPayments;
      }, 0);

      accruedInterest = Math.max(0, Math.round(totalAccrued - totalInterestPaid));
      
      const interestPerPeriod = principalOutstanding * rate;
      if (interestPerPeriod > 0) {
        unpaidPeriods = (accruedInterest / interestPerPeriod).toFixed(1);
      }
    } else if (loan.interestType === 'EMI') {
      // For EMI, interest is already fixed. Preclosure could optionally waive future interest, but usually they pay the full remaining.
      // For simplicity, we just use the remaining unpaid interest.
      const paid = loan.repayments.reduce((acc, r) => acc + (r.paidAmount || 0), 0);
      const totalRemaining = Math.max(0, (loan.totalPayable || loan.principalAmount) - paid);
      accruedInterest = Math.max(0, totalRemaining - principalOutstanding);
    } else {
      // WITHOUT_INTEREST
      accruedInterest = 0;
    }

    res.json({ success: true, data: { principalOutstanding, accruedInterest, unpaidPeriods, tenureUnitStr } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/loans/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    // Run maintenance tasks in background — do NOT block HTTP response
    syncOverdueStatus(prisma).catch(err => console.error('syncOverdueStatus error:', err));
    autoExtendIfNeeded(req.params.id).catch(err => console.error('autoExtend error:', err));

    const loan = await prisma.loan.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        agent: { select: { id: true, name: true, phone: true } },
        repayments: {
          include: { payments: { include: { collectedBy: { select: { id: true, name: true } } } } },
          orderBy: { installmentNo: 'asc' },
        },
      },
    });
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    if (req.user.role === 'CUSTOMER') {
      const isOwner = loan.customer && (loan.customer.userId === req.user.id || (req.user.phone && loan.customer.phone === req.user.phone));
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Access denied. You can only view your own loan details.' });
      }
    } else {
      // Enforce admin workspace isolation — check loan.adminId first, fall back to customer.adminId
      const ownershipTarget = loan.adminId ? loan : loan.customer;
      try { assertOwnership(ownershipTarget, req.user, 'Loan'); } catch (ownerErr) {
        return res.status(ownerErr.statusCode || 403).json({ success: false, message: ownerErr.message });
      }
    }

    res.json({ success: true, data: loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/loans — Create loan
router.post('/', authenticate, authorize('ADMIN', 'AGENT'), async (req, res) => {
  try {
    const {
      customerId, agentId, principalAmount, interestRate,
      interestType = 'FLAT', tenure, tenureUnit = 'MONTHS',
      processingFee = 0, advanceDeduction, repaymentFrequency, startDate, alreadyCollectedAmount = 0,
    } = req.body;

    if (!customerId || !principalAmount || interestRate === undefined || !startDate) {
      return res.status(400).json({ success: false, message: 'Missing required loan fields' });
    }

    const start = new Date(startDate);
    const fee = parseFloat(advanceDeduction || processingFee || 0);
    
    let batchSize, interestPerPeriod, principalPerPeriod, installmentAmount, totalPayable, totalInterest;
    let frequency = repaymentFrequency || (tenureUnit === 'DAYS' ? 'DAILY' : tenureUnit === 'WEEKS' ? 'WEEKLY' : 'MONTHLY');

    if (interestType === 'WITHOUT_INTEREST') {
      const tenureVal = tenure ? parseInt(tenure) : (tenureUnit === 'DAYS' ? 30 : tenureUnit === 'WEEKS' ? 10 : 12);
      
      // Calculate total installments based on frequency vs tenureUnit
      if (frequency === 'DAILY') {
        batchSize = (tenureUnit === 'WEEKS') ? tenureVal * 7 : (tenureUnit === 'MONTHS') ? tenureVal * 30 : (tenureUnit === 'YEARS') ? tenureVal * 365 : tenureVal;
      } else if (frequency === 'WEEKLY') {
        batchSize = (tenureUnit === 'MONTHS') ? tenureVal * 4 : (tenureUnit === 'YEARS') ? tenureVal * 52 : tenureVal;
      } else if (frequency === 'MONTHLY') {
        batchSize = (tenureUnit === 'YEARS') ? tenureVal * 12 : tenureVal;
      } else {
        batchSize = tenureVal;
      }
      batchSize = Math.max(1, batchSize);

      interestPerPeriod = 0;
      principalPerPeriod = parseFloat(principalAmount) / batchSize;
      installmentAmount = principalPerPeriod;
      totalPayable = parseFloat(principalAmount);
      totalInterest = 0;
    } else if (interestType === 'EMI') {
      batchSize = tenure ? parseInt(tenure) : getBatchSize(tenureUnit);
      const r_per_period = parseFloat(interestRate);
      
      interestPerPeriod = batchSize > 0 ? parseFloat(principalAmount) * (r_per_period / 100) : 0;
      principalPerPeriod = batchSize > 0 ? parseFloat(principalAmount) / batchSize : 0;
      installmentAmount = interestPerPeriod + principalPerPeriod;
      
      totalInterest = interestPerPeriod * batchSize;
      totalPayable = parseFloat(principalAmount) + totalInterest;
    } else {
      batchSize = tenure ? parseInt(tenure) : getBatchSize(tenureUnit);
      interestPerPeriod = parseFloat(principalAmount) * (parseFloat(interestRate) / 100);
      principalPerPeriod = 0;
      installmentAmount = interestPerPeriod;
      totalPayable = parseFloat(principalAmount) + (interestPerPeriod * batchSize);
      totalInterest = interestPerPeriod * batchSize;
    }

    const calc = {
      totalInterest: round2(totalInterest),
      totalPayable: round2(totalPayable),
      installmentAmount: round2(installmentAmount),
    };

    // End date calculation
    const end = new Date(start);
    if (frequency === 'DAILY' || tenureUnit === 'DAYS') end.setDate(end.getDate() + batchSize);
    else if (frequency === 'WEEKLY' || tenureUnit === 'WEEKS') end.setDate(end.getDate() + batchSize * 7);
    else if (frequency === 'YEARLY' || tenureUnit === 'YEARS') end.setFullYear(end.getFullYear() + batchSize);
    else end.setMonth(end.getMonth() + batchSize);

    // Generate sequential loan number
    const lastLoan = await prisma.loan.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { loanNumber: true }
    });
    let nextSeq = 1;
    if (lastLoan && lastLoan.loanNumber && lastLoan.loanNumber.startsWith('LN-')) {
      const parts = lastLoan.loanNumber.split('-');
      if (parts.length === 2 && !isNaN(parts[1])) {
        nextSeq = parseInt(parts[1], 10) + 1;
      }
    } else {
      const count = await prisma.loan.count();
      nextSeq = count + 1;
    }
    const loanNumber = `LN-${String(nextSeq).padStart(4, '0')}`;

    const targetAdminId = req.user.role === 'ADMIN' ? req.user.id : (req.user.adminId || req.user.id);
    const loan = await prisma.loan.create({
      data: {
        loanNumber,
        customerId,
        adminId: targetAdminId,
        creatorId: req.user.id,
        agentId: agentId || req.user.id,
        principalAmount: parseFloat(principalAmount),
        interestRate: parseFloat(interestRate),
        interestType,
        tenure: batchSize,
        tenureUnit,
        processingFee: fee,
        ...calc,
        interestCollected: 0,
        outstandingPrincipal: parseFloat(principalAmount),
        status: 'ACTIVE',
        disbursedAt: new Date(),
        startDate: start,
        endDate: end,
      },
    });

    // Generate initial installment batch
    const installments = generateInstallments(
      loan.id, principalPerPeriod, interestPerPeriod, tenureUnit, start, 1, batchSize, frequency
    );
    await prisma.repayment.createMany({ data: installments });

    // Handle Pre-collected Amount (alreadyCollectedAmount)
    let remainingCollected = parseFloat(alreadyCollectedAmount);
    if (remainingCollected > 0) {
      const createdReps = await prisma.repayment.findMany({
        where: { loanId: loan.id },
        orderBy: { installmentNo: 'asc' }
      });
      let totalInterestPaid = 0;
      
      for (const rep of createdReps) {
        if (remainingCollected <= 0) break;
        const pendingAmount = rep.dueAmount - rep.paidAmount;
        const toPay = Math.min(pendingAmount, remainingCollected);
        
        if (toPay > 0) {
          const newPaidAmount = rep.paidAmount + toPay;
          const status = newPaidAmount >= rep.dueAmount ? 'PAID' : 'PARTIAL';
          
          await prisma.repayment.update({
            where: { id: rep.id },
            data: { paidAmount: newPaidAmount, paidAt: new Date(), status }
          });
          
          await prisma.payment.create({
            data: {
              repaymentId: rep.id,
              collectedById: loan.agentId,
              amount: toPay,
              paymentMode: 'CASH',
              paymentType: 'INTEREST',
              reference: 'Pre-collected Entry',
              collectedAt: new Date()
            }
          });
          remainingCollected -= toPay;
          totalInterestPaid += toPay;
        }
      }
      
      if (totalInterestPaid > 0) {
        await prisma.loan.update({
          where: { id: loan.id },
          data: { interestCollected: { increment: totalInterestPaid } }
        });
      }
    }

    await auditLog(req.user.id, 'CREATE_LOAN', 'Loan', loan.id, { loanNumber, principalAmount, continuous: true, alreadyCollectedAmount }, req);

    const fullLoan = await prisma.loan.findUnique({
      where: { id: loan.id },
      include: { customer: true, repayments: { orderBy: { installmentNo: 'asc' } } },
    });

    res.status(201).json({ success: true, data: fullLoan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/loans/:id/status
router.patch('/:id/status', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const existing = await prisma.loan.findUnique({ where: { id: req.params.id }, select: { id: true, adminId: true, customer: { select: { adminId: true } } } });
    if (!existing) return res.status(404).json({ success: false, message: 'Loan not found' });
    const ownershipTarget = existing.adminId ? existing : existing.customer;
    try { assertOwnership(ownershipTarget, req.user, 'Loan'); } catch (ownerErr) {
      return res.status(ownerErr.statusCode || 403).json({ success: false, message: ownerErr.message });
    }
    const { status } = req.body;
    const loan = await prisma.loan.update({ where: { id: req.params.id }, data: { status } });
    await auditLog(req.user.id, 'UPDATE_LOAN_STATUS', 'Loan', loan.id, { status }, req);
    res.json({ success: true, data: loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/loans/:id/top-up-eligibility — Check top-up loan eligibility & rollover balance
router.get('/:id/top-up-eligibility', authenticate, async (req, res) => {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        repayments: { orderBy: { installmentNo: 'asc' } }
      }
    });
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
    
    // Ownership check
    const ownershipTarget = loan.adminId ? loan : loan.customer;
    try { assertOwnership(ownershipTarget, req.user, 'Loan'); } catch (ownerErr) {
      return res.status(ownerErr.statusCode || 403).json({ success: false, message: ownerErr.message });
    }

    if (loan.status !== 'ACTIVE') {
      return res.json({
        success: true,
        data: {
          eligible: false,
          reason: `Loan is currently ${loan.status}. Only ACTIVE loans can be rolled over or topped up.`,
          loan
        }
      });
    }

    const totalRepayments = loan.repayments.length;
    const paidRepayments = loan.repayments.filter(r => r.status === 'PAID').length;
    const overdueRepayments = loan.repayments.filter(r => r.status === 'OVERDUE').length;
    
    const tenureProgress = totalRepayments > 0 ? Math.round((paidRepayments / totalRepayments) * 100) : 0;
    
    // Calculate remaining balance to be settled
    let outstandingBalance = 0;
    if (loan.interestType === 'WITHOUT_INTEREST') {
      const paidTotal = loan.repayments.reduce((sum, r) => sum + (r.paidAmount || 0), 0);
      outstandingBalance = Math.max(0, loan.principalAmount - paidTotal);
    } else {
      outstandingBalance = loan.outstandingPrincipal !== null && loan.outstandingPrincipal !== undefined
        ? loan.outstandingPrincipal
        : loan.principalAmount;
    }

    // Add any unpaid interest due up to today
    const unpaidInterest = loan.repayments
      .filter(r => (r.status === 'OVERDUE' || r.status === 'PARTIAL') && new Date(r.dueDate) <= new Date())
      .reduce((sum, r) => sum + Math.max(0, (r.dueAmount || 0) - (r.paidAmount || 0)), 0);
    
    const totalDeductionRequired = Math.round((outstandingBalance + unpaidInterest) * 100) / 100;

    // Standard eligibility criteria: >= 60% completion and 0 overdues
    const isEligible = (tenureProgress >= 60 || paidRepayments >= Math.floor(totalRepayments * 0.6)) && overdueRepayments === 0;

    res.json({
      success: true,
      data: {
        eligible: isEligible,
        tenureProgress,
        totalRepayments,
        paidRepayments,
        overdueRepayments,
        outstandingPrincipal: outstandingBalance,
        unpaidInterest,
        totalOldBalanceDeduction: totalDeductionRequired,
        loan: {
          id: loan.id,
          loanNumber: loan.loanNumber,
          principalAmount: loan.principalAmount,
          outstandingPrincipal: loan.outstandingPrincipal,
          interestRate: loan.interestRate,
          tenureUnit: loan.tenureUnit,
          customer: {
            id: loan.customer?.id,
            name: loan.customer?.name,
            phone: loan.customer?.phone
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/loans/:id/top-up — Execute Top-Up / Renewal Loan Rollover
router.post('/:id/top-up', authenticate, authorize('ADMIN', 'AGENT'), async (req, res) => {
  try {
    const oldLoanId = req.params.id;
    const {
      newPrincipalAmount,
      interestRate,
      tenure,
      tenureUnit = 'MONTHS',
      interestType = 'FLAT',
      processingFee = 0,
      agentId,
      startDate = new Date().toISOString(),
      repaymentFrequency
    } = req.body;

    if (!newPrincipalAmount || parseFloat(newPrincipalAmount) <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid new loan principal amount' });
    }

    const oldLoan = await prisma.loan.findUnique({
      where: { id: oldLoanId },
      include: { customer: true, repayments: true }
    });

    if (!oldLoan) return res.status(404).json({ success: false, message: 'Original loan not found' });
    if (oldLoan.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: `Loan cannot be topped up because it is ${oldLoan.status}` });
    }

    // Ownership check
    const ownershipTarget = oldLoan.adminId ? oldLoan : oldLoan.customer;
    try { assertOwnership(ownershipTarget, req.user, 'Loan'); } catch (ownerErr) {
      return res.status(ownerErr.statusCode || 403).json({ success: false, message: ownerErr.message });
    }

    // Calculate old loan remaining balance
    let oldOutstanding = oldLoan.outstandingPrincipal !== null && oldLoan.outstandingPrincipal !== undefined
      ? oldLoan.outstandingPrincipal
      : oldLoan.principalAmount;
    
    if (oldLoan.interestType === 'WITHOUT_INTEREST') {
      const paidTotal = oldLoan.repayments.reduce((sum, r) => sum + (r.paidAmount || 0), 0);
      oldOutstanding = Math.max(0, oldLoan.principalAmount - paidTotal);
    }

    const unpaidInterest = oldLoan.repayments
      .filter(r => (r.status === 'OVERDUE' || r.status === 'PARTIAL') && new Date(r.dueDate) <= new Date())
      .reduce((sum, r) => sum + Math.max(0, (r.dueAmount || 0) - (r.paidAmount || 0)), 0);

    const totalOldBalance = round2(oldOutstanding + unpaidInterest);
    const newPrincipal = parseFloat(newPrincipalAmount);
    const fee = parseFloat(processingFee || 0);

    if (newPrincipal <= totalOldBalance) {
      return res.status(400).json({
        success: false,
        message: `New loan amount (₹${newPrincipal}) must be greater than the outstanding rollover balance (₹${totalOldBalance}).`
      });
    }

    const netDisbursedAmount = round2(newPrincipal - totalOldBalance - fee);

    // Prepare calculations for the new loan
    const rate = parseFloat(interestRate !== undefined ? interestRate : oldLoan.interestRate);
    const start = new Date(startDate);
    let batchSize, interestPerPeriod, principalPerPeriod, installmentAmount, totalPayable, totalInterest;
    let frequency = repaymentFrequency || (tenureUnit === 'DAYS' ? 'DAILY' : tenureUnit === 'WEEKS' ? 'WEEKLY' : 'MONTHLY');

    if (interestType === 'WITHOUT_INTEREST') {
      const isDaily = frequency === 'DAILY' || tenureUnit === 'DAYS';
      const weeksOrDays = tenure ? parseInt(tenure) : 10;
      batchSize = isDaily ? (tenureUnit === 'DAYS' ? weeksOrDays : weeksOrDays * 7) : weeksOrDays;
      interestPerPeriod = 0;
      principalPerPeriod = newPrincipal / batchSize;
      installmentAmount = principalPerPeriod;
      totalPayable = newPrincipal;
      totalInterest = 0;
    } else if (interestType === 'EMI') {
      batchSize = tenure ? parseInt(tenure) : getBatchSize(tenureUnit);
      interestPerPeriod = batchSize > 0 ? newPrincipal * (rate / 100) : 0;
      principalPerPeriod = batchSize > 0 ? newPrincipal / batchSize : 0;
      installmentAmount = interestPerPeriod + principalPerPeriod;
      totalInterest = interestPerPeriod * batchSize;
      totalPayable = newPrincipal + totalInterest;
    } else {
      batchSize = getBatchSize(tenureUnit);
      interestPerPeriod = newPrincipal * (rate / 100);
      principalPerPeriod = 0;
      installmentAmount = interestPerPeriod;
      totalInterest = interestPerPeriod * batchSize;
      totalPayable = newPrincipal + totalInterest;
    }

    // End date calculation
    const end = new Date(start);
    if (frequency === 'DAILY' || tenureUnit === 'DAYS') end.setDate(end.getDate() + batchSize);
    else if (tenureUnit === 'MONTHS') end.setMonth(end.getMonth() + batchSize);
    else if (tenureUnit === 'WEEKS' || frequency === 'WEEKLY') end.setDate(end.getDate() + batchSize * 7);
    else end.setDate(end.getDate() + batchSize);

    // Generate new sequential loan number
    const lastLoan = await prisma.loan.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { loanNumber: true }
    });
    let nextSeq = 1;
    if (lastLoan && lastLoan.loanNumber) {
      const match = lastLoan.loanNumber.match(/\d+$/);
      if (match) nextSeq = parseInt(match[0], 10) + 1;
    }
    const loanNumber = `LN${String(nextSeq).padStart(4, '0')}`;

    // Execute atomic transaction: close old loan and disburse new top-up loan
    const result = await prisma.$transaction(async (tx) => {
      // 1. Close old loan
      await tx.loan.update({
        where: { id: oldLoanId },
        data: {
          status: 'CLOSED',
          outstandingPrincipal: 0
        }
      });

      // Mark all pending repayments of old loan as cancelled/settled
      await tx.repayment.updateMany({
        where: { loanId: oldLoanId, status: { in: ['PENDING', 'OVERDUE', 'PARTIAL'] } },
        data: { status: 'PAID', paidAmount: 0 }
      });

      // 2. Create new Top-Up loan
      const activeAdminId = req.user.role === 'ADMIN' ? req.user.id : (req.user.adminId || oldLoan.adminId);
      const newLoan = await tx.loan.create({
        data: {
          loanNumber,
          customerId: oldLoan.customerId,
          adminId: activeAdminId,
          creatorId: req.user.id,
          agentId: agentId || req.user.id,
          principalAmount: newPrincipal,
          interestRate: rate,
          interestType,
          tenure: batchSize,
          tenureUnit,
          repaymentFrequency: frequency,
          processingFee: fee,
          totalInterest: round2(totalInterest),
          totalPayable: round2(totalPayable),
          installmentAmount: round2(installmentAmount),
          outstandingPrincipal: newPrincipal,
          startDate: start,
          endDate: end,
          status: 'ACTIVE',
        }
      });

      // 3. Generate installments for new loan
      const installments = generateInstallments(
        newLoan.id,
        principalPerPeriod,
        interestPerPeriod,
        tenureUnit,
        start,
        1,
        batchSize,
        frequency
      );
      await tx.repayment.createMany({ data: installments });

      // 4. Audit logs
      await tx.auditLog.create({
        data: {
          userId: req.user.id,
          action: 'TOP_UP_ROLLOVER_LOAN',
          entity: 'Loan',
          entityId: newLoan.id,
          details: JSON.stringify({
            oldLoanId,
            oldLoanNumber: oldLoan.loanNumber,
            oldBalanceDeducted: totalOldBalance,
            newLoanNumber: newLoan.loanNumber,
            newPrincipal,
            netDisbursedCash: netDisbursedAmount,
            processingFee: fee
          }),
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'App'
        }
      });

      return newLoan;
    });

    res.status(201).json({
      success: true,
      message: `Top-Up successful! Old loan ${oldLoan.loanNumber} closed. New loan ${result.loanNumber} created with net cash disbursement of ₹${netDisbursedAmount.toLocaleString('en-IN')}.`,
      data: {
        newLoan: result,
        rolloverSummary: {
          oldLoanNumber: oldLoan.loanNumber,
          oldBalanceDeducted: totalOldBalance,
          newPrincipal,
          processingFee: fee,
          netDisbursedCash: netDisbursedAmount
        }
      }
    });
  } catch (error) {
    console.error('Top-up error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/loans/:id
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const loanId = req.params.id;
    const loan = await prisma.loan.findUnique({ where: { id: loanId }, include: { customer: { select: { adminId: true } } } });
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    // Ownership check
    const ownershipTarget = loan.adminId ? loan : loan.customer;
    try { assertOwnership(ownershipTarget, req.user, 'Loan'); } catch (ownerErr) {
      return res.status(ownerErr.statusCode || 403).json({ success: false, message: ownerErr.message });
    }

    // Cascade delete manually
    const repayments = await prisma.repayment.findMany({ where: { loanId }, select: { id: true } });
    const repaymentIds = repayments.map(r => r.id);

    if (repaymentIds.length > 0) {
      await prisma.notificationLog.deleteMany({ where: { repaymentId: { in: repaymentIds } } });
      await prisma.payment.deleteMany({ where: { repaymentId: { in: repaymentIds } } });
      await prisma.repayment.deleteMany({ where: { id: { in: repaymentIds } } });
    }
    
    await prisma.loan.delete({ where: { id: loanId } });
    await auditLog(req.user.id, 'DELETE_LOAN', 'Loan', loanId, { loanNumber: loan.loanNumber }, req);

    res.json({ success: true, message: 'Loan permanently deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/loans/:id/report — Download CSV report of the full loan history
router.get('/:id/report', authenticate, async (req, res) => {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        agent: { select: { name: true, phone: true } },
        repayments: {
          include: {
            payments: {
              include: { collectedBy: { select: { name: true } } },
              orderBy: { collectedAt: 'asc' },
            },
          },
          orderBy: { installmentNo: 'asc' },
        },
      },
    });

    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
    const formatDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

    // Build CSV content
    let csv = '';

    // ─── Section 1: Loan Summary ───
    csv += 'LOAN REPORT\r\n';
    csv += `Generated On,"${formatDateTime(new Date())}"\r\n`;
    csv += '\r\n';
    csv += 'LOAN DETAILS\r\n';
    csv += `Loan Number,"${loan.loanNumber}"\r\n`;
    csv += `Status,"${loan.status}"\r\n`;
    csv += `Customer Name,"${loan.customer?.name}"\r\n`;
    csv += `Customer Phone,"${loan.customer?.phone}"\r\n`;
    csv += `Customer Address,"${loan.customer?.address || 'N/A'}"\r\n`;
    csv += `Agent,"${loan.agent?.name || 'N/A'}"\r\n`;
    csv += `Principal Amount,"${loan.principalAmount}"\r\n`;
    csv += `Outstanding Principal,"${loan.outstandingPrincipal ?? loan.principalAmount}"\r\n`;
    csv += `Interest Rate,"${loan.interestRate}% per ${loan.tenureUnit === 'WEEKS' ? 'week' : loan.tenureUnit === 'MONTHS' ? 'month' : 'day'}"\r\n`;
    csv += `Installment Amount,"${loan.installmentAmount}"\r\n`;
    csv += `Collection Frequency,"${loan.tenureUnit === 'WEEKS' ? 'Weekly' : loan.tenureUnit === 'MONTHS' ? 'Monthly' : 'Daily'}"\r\n`;
    csv += `Total Interest Collected,"${loan.interestCollected || 0}"\r\n`;
    csv += `Start Date,"${formatDate(loan.startDate)}"\r\n`;
    csv += `Created On,"${formatDate(loan.createdAt)}"\r\n`;
    csv += '\r\n';

    // ─── Section 2: Interest Collection Schedule ───
    csv += 'INTEREST COLLECTION SCHEDULE\r\n';
    csv += 'Installment #,Due Date,Interest Due,Paid Amount,Status,Paid On,Collected By,Payment Mode,Reference\r\n';

    // Only include repayments that are PAID or have some activity
    const paidRepayments = loan.repayments.filter(r => r.status === 'PAID' || r.paidAmount > 0);

    for (const r of paidRepayments) {
      if (r.payments && r.payments.length > 0) {
        for (const p of r.payments) {
          if (p.paymentType === 'PRINCIPAL') continue; // Skip principal payments here
          csv += `${r.installmentNo},"${formatDate(r.dueDate)}",${r.dueAmount},${p.amount},${r.status},"${formatDateTime(p.collectedAt)}","${p.collectedBy?.name || 'N/A'}",${p.paymentMode || 'CASH'},"${p.reference || ''}"\r\n`;
        }
      } else {
        csv += `${r.installmentNo},"${formatDate(r.dueDate)}",${r.dueAmount},${r.paidAmount},${r.status},"${formatDate(r.paidAt)}","-","-","-"\r\n`;
      }
    }
    csv += '\r\n';

    // ─── Section 3: Principal Payments ───
    const principalPayments = loan.repayments
      .flatMap(r => (r.payments || []).filter(p => p.paymentType === 'PRINCIPAL'));

    if (principalPayments.length > 0) {
      csv += 'PRINCIPAL PAYMENTS\r\n';
      csv += 'Date,Amount,Payment Mode,Reference,Collected By,Notes\r\n';
      for (const p of principalPayments) {
        csv += `"${formatDateTime(p.collectedAt)}",${p.amount},${p.paymentMode || 'CASH'},"${p.reference || ''}","${p.collectedBy?.name || 'N/A'}","${p.notes || ''}"\r\n`;
      }
      csv += '\r\n';
    }

    // ─── Section 4: Summary ───
    const totalInterestPaid = paidRepayments.reduce((sum, r) => sum + (r.paidAmount || 0), 0);
    const totalPrincipalPaid = principalPayments.reduce((sum, p) => sum + p.amount, 0);
    csv += 'SUMMARY\r\n';
    csv += `Total Interest Payments,"${paidRepayments.length}"\r\n`;
    csv += `Total Interest Collected,"${round2(totalInterestPaid)}"\r\n`;
    csv += `Total Principal Paid,"${round2(totalPrincipalPaid)}"\r\n`;
    csv += `Grand Total Received,"${round2(totalInterestPaid + totalPrincipalPaid)}"\r\n`;
    csv += `Outstanding Principal,"${loan.outstandingPrincipal ?? loan.principalAmount}"\r\n`;
    csv += `Loan Status,"${loan.status}"\r\n`;

    // Send as downloadable CSV
    const filename = `Loan_${loan.loanNumber}_Report_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
