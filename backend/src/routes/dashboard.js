const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { syncOverdueStatus } = require('../utils/loanCalc');
const { getCustomerFilter, getLoanFilter } = require('../utils/tenant');
const prisma = new PrismaClient();

const summaryCache = new Map();

function clearSummaryCache(userId = null) {
  if (userId) {
    summaryCache.delete(userId);
  } else {
    summaryCache.clear();
  }
}

// GET /api/dashboard/summary
router.get('/summary', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const userId = req.user.id;
    const nowTs = Date.now();
    const cached = summaryCache.get(userId);
    if (cached && (nowTs - cached.time < 15000)) {
      return res.json(cached.data);
    }

    const now = new Date();
    
    // Start of current day
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Start of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Next 7 days
    const next7Days = new Date(startOfToday);
    next7Days.setDate(next7Days.getDate() + 7);

    syncOverdueStatus(prisma).catch(err => console.error('syncOverdueStatus error:', err));

    const customerFilter = getCustomerFilter(req.user);
    const loanFilter = getLoanFilter(req.user);

    const [
      activeLoans,
      activeCustomers
    ] = await Promise.all([
      prisma.loan.count({ where: { status: 'ACTIVE', AND: [loanFilter] } }),
      prisma.customer.count({ where: { isActive: true, AND: [customerFilter] } }),
    ]);

    // Financial aggregates (Overall)
    const loanAgg = await prisma.loan.aggregate({
      where: { status: { in: ['ACTIVE', 'CLOSED', 'DEFAULTED'] }, AND: [loanFilter] },
      _sum: { principalAmount: true, totalPayable: true, totalInterest: true },
    });

    // Payments aggregate
    const paymentAgg = await prisma.payment.aggregate({
      where: { repayment: { loan: loanFilter } },
      _sum: { amount: true },
    });

    // Today's Collection
    const todaysPayments = await prisma.payment.aggregate({
      where: {
        collectedAt: { gte: startOfToday, lte: endOfToday },
        repayment: { loan: loanFilter }
      },
      _sum: { amount: true },
    });

    // Today's Dues
    const todaysDues = await prisma.repayment.aggregate({
      where: {
        dueDate: { gte: startOfToday, lte: endOfToday },
        loan: loanFilter
      },
      _sum: { dueAmount: true, paidAmount: true },
    });

    // Pending Collections = ONLY already-due amounts (OVERDUE + PARTIAL + today's pending)
    const pendingDues = await prisma.repayment.aggregate({
      where: {
        loan: loanFilter,
        OR: [
          { status: 'OVERDUE' },
          { status: 'PARTIAL' },
          { status: 'PENDING', dueDate: { lte: endOfToday } },
        ]
      },
      _sum: { dueAmount: true, paidAmount: true },
    });

    // Overdue Loans Count (Distinct loans with overdue)
    const overdueLoans = await prisma.repayment.groupBy({
      by: ['loanId'],
      where: {
        status: 'OVERDUE',
        loan: loanFilter
      },
    });

    const overdueAgg = await prisma.repayment.aggregate({
      where: {
        status: 'OVERDUE',
        loan: loanFilter
      },
      _sum: { dueAmount: true, paidAmount: true },
    });

    // Monthly Aggregates
    const monthlyLoans = await prisma.loan.aggregate({
      where: { createdAt: { gte: startOfMonth }, AND: [loanFilter] },
      _sum: { principalAmount: true, totalInterest: true },
    });

    const monthlyPayments = await prisma.payment.aggregate({
      where: {
        collectedAt: { gte: startOfMonth },
        repayment: { loan: loanFilter }
      },
      _sum: { amount: true },
    });

    // Calculate actual realized monthly interest & profit
    const monthlyPaymentRecords = await prisma.payment.findMany({
      where: {
        collectedAt: { gte: startOfMonth },
        repayment: { loan: loanFilter }
      },
      include: {
        repayment: {
          include: { loan: { select: { interestType: true, principalAmount: true, totalPayable: true, totalInterest: true } } }
        }
      }
    });

    let monthlyInterestIncome = 0;
    let monthlyCashPrincipal = 0;
    let monthlyCashInterest = 0;

    monthlyPaymentRecords.forEach(p => {
      const loan = p.repayment?.loan;
      const amt = p.amount || 0;
      if (!loan) return;
      const type = loan.interestType || 'FLAT';
      
      if (type === 'FLAT') {
        if (p.paymentType === 'PRINCIPAL') {
          monthlyCashPrincipal += amt;
        } else {
          monthlyInterestIncome += amt;
          monthlyCashInterest += amt;
        }
      } else if (type === 'EMI') {
        const interestRatio = loan.totalPayable > 0 ? (loan.totalInterest / loan.totalPayable) : 0;
        const intPortion = amt * interestRatio;
        const princPortion = amt - intPortion;
        monthlyInterestIncome += intPortion;
        monthlyCashInterest += intPortion;
        monthlyCashPrincipal += princPortion;
      } else if (type === 'WITHOUT_INTEREST') {
        monthlyCashPrincipal += amt;
      }
    });

    const monthlyDeductionLoans = await prisma.loan.findMany({
      where: {
        createdAt: { gte: startOfMonth },
        interestType: 'WITHOUT_INTEREST',
        AND: [loanFilter]
      },
      select: { totalInterest: true, processingFee: true }
    });

    monthlyDeductionLoans.forEach(l => {
      monthlyInterestIncome += (l.totalInterest || l.processingFee || 0);
    });

    monthlyInterestIncome = Math.round(monthlyInterestIncome * 100) / 100;

    // === All-Time Actual Profit (what was really collected, not expected) ===
    const allPaymentRecords = await prisma.payment.findMany({
      where: {
        repayment: { loan: loanFilter }
      },
      include: {
        repayment: {
          include: { loan: { select: { interestType: true, totalPayable: true, totalInterest: true } } }
        }
      }
    });

    let totalActualProfit = 0;
    allPaymentRecords.forEach(p => {
      const loan = p.repayment?.loan;
      if (!loan) return;
      const type = loan.interestType || 'FLAT';
      if (type === 'FLAT') {
        if (p.paymentType !== 'PRINCIPAL') {
          totalActualProfit += (p.amount || 0);
        }
      } else if (type === 'EMI') {
        const interestRatio = loan.totalPayable > 0 ? (loan.totalInterest / loan.totalPayable) : 0;
        totalActualProfit += (p.amount || 0) * interestRatio;
      }
    });

    // All deduction-based loans: interest was realized at disbursement
    const allDeductionLoans = await prisma.loan.findMany({
      where: {
        interestType: 'WITHOUT_INTEREST',
        AND: [loanFilter]
      },
      select: { totalInterest: true, processingFee: true }
    });
    allDeductionLoans.forEach(l => {
      totalActualProfit += (l.totalInterest || l.processingFee || 0);
    });
    totalActualProfit = Math.round(totalActualProfit * 100) / 100;

    // Upcoming Dues (Next 7 days)
    const upcomingDues = await prisma.repayment.findMany({
      where: { 
        dueDate: { gt: endOfToday, lte: next7Days },
        status: { in: ['PENDING', 'PARTIAL'] },
        loan: loanFilter
      },
      include: { loan: { include: { customer: { select: { name: true, phone: true } } } } },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });

    // Recent Collections (Last 5)
    const recentCollections = await prisma.payment.findMany({
      where: {
        repayment: { loan: loanFilter }
      },
      include: { 
        repayment: { include: { loan: { include: { customer: { select: { name: true } } } } } },
        collectedBy: { select: { name: true } }
      },
      orderBy: { collectedAt: 'desc' },
      take: 5,
    });

    // Monthly Chart Data (Last 6 months)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      
      const [mPay, mLoan] = await Promise.all([
        prisma.payment.aggregate({
          where: {
            collectedAt: { gte: start, lte: end },
            repayment: { loan: loanFilter }
          },
          _sum: { amount: true }
        }),
        prisma.loan.aggregate({
          where: {
            createdAt: { gte: start, lte: end },
            AND: [loanFilter]
          },
          _sum: { principalAmount: true, totalInterest: true }
        })
      ]);

      const mPayRecords = await prisma.payment.findMany({
        where: {
          collectedAt: { gte: start, lte: end },
          repayment: { loan: loanFilter }
        },
        include: {
          repayment: {
            include: { loan: { select: { interestType: true, totalPayable: true, totalInterest: true } } }
          }
        }
      });
      let mInterest = 0;
      mPayRecords.forEach(p => {
        const loan = p.repayment?.loan;
        if (!loan) return;
        const type = loan.interestType || 'FLAT';
        if (type === 'FLAT') {
          if (p.paymentType !== 'PRINCIPAL') {
            mInterest += (p.amount || 0);
          }
        } else if (type === 'EMI') {
          const interestRatio = loan.totalPayable > 0 ? (loan.totalInterest / loan.totalPayable) : 0;
          mInterest += (p.amount || 0) * interestRatio;
        }
      });
      const mDeductionLoans = await prisma.loan.findMany({
        where: {
          createdAt: { gte: start, lte: end },
          interestType: 'WITHOUT_INTEREST',
          AND: [loanFilter]
        },
        select: { totalInterest: true, processingFee: true }
      });
      mDeductionLoans.forEach(l => { mInterest += (l.totalInterest || l.processingFee || 0); });
      mInterest = Math.round(mInterest * 100) / 100;
      
      months.push({
        name: start.toLocaleString('default', { month: 'short' }),
        disbursed: mLoan._sum.principalAmount || 0,
        collected: mPay._sum.amount || 0,
        interest: mInterest,
        profit: mInterest,
      });
    }

    // Outstanding separated by Loan Types and Principal vs Interest
    const activeLoanRecords = await prisma.loan.findMany({
      where: { status: 'ACTIVE', AND: [loanFilter] },
      select: {
        id: true,
        interestType: true,
        principalAmount: true,
        totalPayable: true,
        outstandingPrincipal: true,
        repayments: { select: { status: true, dueDate: true, dueAmount: true, paidAmount: true } },
      },
    });

    let totalOutstandingPrincipal = 0;
    let totalOutstandingInterest = 0;

    const outstandingByLoanType = {
      FLAT: { count: 0, amount: 0, principal: 0, interest: 0, label: 'Regular Interest (வட்டி)' },
      WITHOUT_INTEREST: { count: 0, amount: 0, principal: 0, interest: 0, label: 'Deduction Based (கழித்து தருவது)' },
      EMI: { count: 0, amount: 0, principal: 0, interest: 0, label: 'Reducing Principal (அசலோடு தவணை)' },
    };

    activeLoanRecords.forEach(loan => {
      const type = loan.interestType || 'FLAT';
      if (!outstandingByLoanType[type]) {
        outstandingByLoanType[type] = { count: 0, amount: 0, principal: 0, interest: 0, label: type };
      }

      let princRemaining = 0;
      let intRemaining = 0;

      if (type === 'FLAT') {
        princRemaining = loan.outstandingPrincipal ?? loan.principalAmount;
        const unpaidDueInterest = (loan.repayments || [])
          .filter(r => r.status === 'OVERDUE' || (r.status === 'PENDING' && new Date(r.dueDate) <= startOfToday) || r.status === 'PARTIAL')
          .reduce((acc, r) => acc + Math.max(0, (r.dueAmount || 0) - (r.paidAmount || 0)), 0);
        intRemaining = unpaidDueInterest;
      } else if (type === 'WITHOUT_INTEREST') {
        const paid = (loan.repayments || []).reduce((acc, r) => acc + (r.paidAmount || 0), 0);
        const totalRemaining = Math.max(0, (loan.totalPayable || loan.principalAmount) - paid);
        princRemaining = totalRemaining;
        intRemaining = 0;
      } else {
        const paid = (loan.repayments || []).reduce((acc, r) => acc + (r.paidAmount || 0), 0);
        const totalRemaining = Math.max(0, (loan.totalPayable || loan.principalAmount) - paid);
        princRemaining = Math.min(totalRemaining, loan.outstandingPrincipal ?? loan.principalAmount);
        intRemaining = Math.max(0, totalRemaining - princRemaining);
      }

      const totalRemaining = princRemaining + intRemaining;

      totalOutstandingPrincipal += princRemaining;
      totalOutstandingInterest += intRemaining;

      outstandingByLoanType[type].count += 1;
      outstandingByLoanType[type].amount += totalRemaining;
      outstandingByLoanType[type].principal += princRemaining;
      outstandingByLoanType[type].interest += intRemaining;
    });

    const todayDueAmt = todaysDues._sum.dueAmount || 0;
    const todayPaidAmt = todaysDues._sum.paidAmount || 0;

    const responsePayload = {
      success: true,
      data: {
        outstandingAmount: totalOutstandingPrincipal + totalOutstandingInterest,
        outstandingPrincipal: totalOutstandingPrincipal,
        outstandingInterest: totalOutstandingInterest,
        totalDisbursed: loanAgg._sum.principalAmount || 0,
        totalCollected: paymentAgg._sum.amount || 0,
        totalInterestCollected: totalActualProfit,
        activeCustomers,
        activeLoans,
        todayCollection: todaysPayments._sum.amount || 0,
        todayDueAmount: todayDueAmt,
        remainingToday: Math.max(0, todayDueAmt - todayPaidAmt),
        pendingCollections: (pendingDues._sum.dueAmount || 0) - (pendingDues._sum.paidAmount || 0),
        overdueLoansCount: overdueLoans.length,
        totalOverdueAmount: (overdueAgg._sum.dueAmount || 0) - (overdueAgg._sum.paidAmount || 0),
        upcomingDues,
        recentCollections,
        outstandingByLoanType,
        monthly: {
          disbursed: monthlyLoans._sum.principalAmount || 0,
          collection: monthlyPayments._sum.amount || 0,
          principalCollected: monthlyCashPrincipal,
          interestCollected: monthlyCashInterest,
          interestIncome: monthlyInterestIncome,
          profit: monthlyInterestIncome,
        },
        monthlyTrend: months,
      },
    };

    summaryCache.set(userId, { data: responsePayload, time: Date.now() });
    res.json(responsePayload);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/dashboard/agent — Agent dashboard
router.get('/agent', authenticate, authorize('ADMIN', 'AGENT'), async (req, res) => {
  try {
    const loanFilter = getLoanFilter(req.user);
    const agentId = req.user.role === 'AGENT' ? req.user.id : (req.query.agentId || null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    syncOverdueStatus(prisma).catch(err => console.error('syncOverdueStatus error:', err));

    const loanWhere = { status: 'ACTIVE', AND: [loanFilter] };
    if (agentId) loanWhere.agentId = agentId;

    const repaymentWhere = { dueDate: { gte: today, lt: tomorrow }, loan: loanFilter };
    if (agentId) repaymentWhere.loan = { ...loanFilter, agentId };

    const paymentWhere = { collectedAt: { gte: today }, repayment: { loan: loanFilter } };
    if (agentId) paymentWhere.collectedById = agentId;

    const paymentWhereAll = { repayment: { loan: loanFilter } };
    if (agentId) paymentWhereAll.collectedById = agentId;

    const [collectedToday, totalCollected] = await Promise.all([
      prisma.payment.aggregate({
        where: paymentWhere,
        _sum: { amount: true },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: paymentWhereAll,
        _sum: { amount: true },
        _count: true,
      })
    ]);

    res.json({
      success: true,
      data: {
        collectedToday: { amount: collectedToday._sum.amount || 0, count: collectedToday._count },
        totalCollected: { amount: totalCollected._sum.amount || 0, count: totalCollected._count },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/dashboard/reset-all-data — Reset production database
router.post('/reset-all-data', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const customerFilter = getCustomerFilter(req.user);
    const loanFilter = getLoanFilter(req.user);
    
    // Find all loan IDs belonging to this admin
    const adminLoans = await prisma.loan.findMany({
      where: loanFilter,
      select: { id: true }
    });
    const loanIds = adminLoans.map(l => l.id);

    if (loanIds.length > 0) {
      const reps = await prisma.repayment.findMany({
        where: { loanId: { in: loanIds } },
        select: { id: true }
      });
      const repIds = reps.map(r => r.id);

      if (repIds.length > 0) {
        await prisma.payment.deleteMany({ where: { repaymentId: { in: repIds } } });
        await prisma.repayment.deleteMany({ where: { id: { in: repIds } } });
      }
      await prisma.loan.deleteMany({ where: { id: { in: loanIds } } });
    }

    await prisma.customer.deleteMany({ where: customerFilter });
    clearSummaryCache(req.user.id);

    res.json({ success: true, message: 'All your data has been reset successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/dashboard/profit — Detailed Profit Breakdown with filters
router.get('/profit', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { loanType, dateFrom, dateTo, period } = req.query;
    const loanFilter = getLoanFilter(req.user);

    // Build date range
    const now = new Date();
    let startDate, endDate;
    if (dateFrom && dateTo) {
      startDate = new Date(dateFrom);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'THIS_WEEK') {
      const day = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - day);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'THIS_MONTH') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'LAST_MONTH') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (period === 'THIS_YEAR') {
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date('2020-01-01');
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
    }

    const loanTypeFilter = loanType && loanType !== 'ALL' ? { interestType: loanType } : {};

    const payments = await prisma.payment.findMany({
      where: {
        collectedAt: { gte: startDate, lte: endDate },
        repayment: {
          loan: {
            ...loanTypeFilter,
            AND: [loanFilter]
          }
        }
      },
      include: {
        repayment: {
          include: {
            loan: {
              select: {
                id: true,
                loanNumber: true,
                interestType: true,
                principalAmount: true,
                totalPayable: true,
                totalInterest: true,
                disbursedAt: true,
                customer: { select: { name: true, phone: true } }
              }
            }
          }
        },
        collectedBy: { select: { name: true } }
      },
      orderBy: { collectedAt: 'desc' }
    });

    let deductionLoans = [];
    if (!loanType || loanType === 'ALL' || loanType === 'WITHOUT_INTEREST') {
      deductionLoans = await prisma.loan.findMany({
        where: {
          disbursedAt: { gte: startDate, lte: endDate },
          interestType: 'WITHOUT_INTEREST',
          AND: [loanFilter]
        },
        select: {
          id: true,
          loanNumber: true,
          interestType: true,
          principalAmount: true,
          totalInterest: true,
          processingFee: true,
          disbursedAt: true,
          customer: { select: { name: true, phone: true } }
        }
      });
    }

    const profitEntries = [];
    let totalProfit = 0;

    const byLoan = {};
    payments.forEach(p => {
      const loan = p.repayment?.loan;
      if (!loan) return;
      const type = loan.interestType || 'FLAT';
      let profit = 0;
      if (type === 'FLAT') {
        if (p.paymentType !== 'PRINCIPAL') {
          profit = p.amount || 0;
        }
      } else if (type === 'EMI') {
        const ratio = loan.totalPayable > 0 ? (loan.totalInterest / loan.totalPayable) : 0;
        profit = (p.amount || 0) * ratio;
      } else {
        return;
      }
      const key = loan.id;
      if (!byLoan[key]) {
        byLoan[key] = {
          loanId: loan.id,
          loanNumber: loan.loanNumber,
          customerName: loan.customer?.name || '-',
          customerPhone: loan.customer?.phone || '-',
          loanType: type,
          principalAmount: loan.principalAmount,
          totalExpectedInterest: loan.totalInterest,
          collectedInterest: 0,
          lastCollected: p.collectedAt
        };
      }
      byLoan[key].collectedInterest = Math.round((byLoan[key].collectedInterest + profit) * 100) / 100;
      totalProfit += profit;
    });

    Object.values(byLoan).forEach(e => profitEntries.push(e));

    deductionLoans.forEach(l => {
      const profit = l.totalInterest || l.processingFee || 0;
      profitEntries.push({
        loanId: l.id,
        loanNumber: l.loanNumber,
        customerName: l.customer?.name || '-',
        customerPhone: l.customer?.phone || '-',
        loanType: 'WITHOUT_INTEREST',
        principalAmount: l.principalAmount,
        totalExpectedInterest: profit,
        collectedInterest: profit,
        lastCollected: l.disbursedAt
      });
      totalProfit += profit;
    });

    totalProfit = Math.round(totalProfit * 100) / 100;

    const byType = { FLAT: 0, EMI: 0, WITHOUT_INTEREST: 0 };
    profitEntries.forEach(e => {
      byType[e.loanType] = Math.round(((byType[e.loanType] || 0) + e.collectedInterest) * 100) / 100;
    });

    res.json({
      success: true,
      data: {
        totalProfit,
        byType,
        entries: profitEntries.sort((a, b) => new Date(b.lastCollected) - new Date(a.lastCollected)),
        dateRange: { from: startDate, to: endDate }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.clearSummaryCache = clearSummaryCache;
module.exports = router;
