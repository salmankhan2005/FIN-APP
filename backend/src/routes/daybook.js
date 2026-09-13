const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { auditLog } = require('../utils/audit');
const { getLoanFilter } = require('../utils/tenant');

const round2 = (num) => Math.round((Number(num) || 0) * 100) / 100;

// GET /api/daybook — Daily Cash Ledger (Roznamcha / நாட்குறிப்பு)
router.get('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const adminId = req.user.id;
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0);
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    const [
      explicitOpening,
      cashCollectionsAgg,
      processingFeesAgg,
      disbursementsAgg,
      expenses,
      recentPayments,
      recentLoans
    ] = await Promise.all([
      // 1. Explicit Opening Balance
      prisma.dayBookOpeningBalance.findFirst({
        where: { adminId, date: { gte: startOfDay, lte: endOfDay } }
      }),
      // 2. Cash Collections received today
      prisma.payment.aggregate({
        where: {
          paymentMode: 'CASH',
          collectedAt: { gte: startOfDay, lte: endOfDay },
          repayment: { loan: getLoanFilter(req.user) }
        },
        _sum: { amount: true },
        _count: { id: true }
      }),
      // 3. Processing fees collected today from loans
      prisma.loan.aggregate({
        where: {
          disbursedAt: { gte: startOfDay, lte: endOfDay },
          AND: [getLoanFilter(req.user)]
        },
        _sum: { processingFee: true }
      }),
      // 4. Principal disbursed today
      prisma.loan.aggregate({
        where: {
          disbursedAt: { gte: startOfDay, lte: endOfDay },
          AND: [getLoanFilter(req.user)]
        },
        _sum: { principalAmount: true },
        _count: { id: true }
      }),
      // 5. Categorized daily expenses
      prisma.expense.findMany({
        where: {
          adminId,
          date: { gte: startOfDay, lte: endOfDay }
        },
        orderBy: { createdAt: 'desc' }
      }),
      // 6. Recent collections itemized list (last 15)
      prisma.payment.findMany({
        where: {
          paymentMode: 'CASH',
          collectedAt: { gte: startOfDay, lte: endOfDay },
          repayment: { loan: getLoanFilter(req.user) }
        },
        include: {
          collectedBy: { select: { name: true } },
          repayment: {
            include: {
              loan: { select: { loanNumber: true, customer: { select: { name: true, phone: true } } } }
            }
          }
        },
        orderBy: { collectedAt: 'desc' },
        take: 15
      }),
      // 7. Recent disbursements itemized list
      prisma.loan.findMany({
        where: {
          disbursedAt: { gte: startOfDay, lte: endOfDay },
          AND: [getLoanFilter(req.user)]
        },
        select: {
          id: true,
          loanNumber: true,
          principalAmount: true,
          processingFee: true,
          customer: { select: { name: true, phone: true } },
          disbursedAt: true
        },
        orderBy: { disbursedAt: 'desc' },
        take: 15
      })
    ]);

    const openingBalance = round2(explicitOpening?.openingBalance || 0);
    const cashCollections = round2(cashCollectionsAgg._sum.amount || 0);
    const processingFees = round2(processingFeesAgg._sum.processingFee || 0);
    const loansDisbursed = round2(disbursementsAgg._sum.principalAmount || 0);

    const totalExpenses = round2(expenses.reduce((sum, e) => sum + (e.amount || 0), 0));

    // Group expenses by category
    const expenseByCategory = {};
    for (const exp of expenses) {
      expenseByCategory[exp.category] = round2((expenseByCategory[exp.category] || 0) + exp.amount);
    }

    const totalInflow = round2(cashCollections + processingFees);
    const totalOutflow = round2(loansDisbursed + totalExpenses);
    const closingBalance = round2(openingBalance + totalInflow - totalOutflow);

    res.json({
      success: true,
      data: {
        date: startOfDay.toISOString().split('T')[0],
        summary: {
          openingBalance,
          cashCollections,
          processingFees,
          totalInflow,
          loansDisbursed,
          totalExpenses,
          totalOutflow,
          closingBalance,
          collectionsCount: cashCollectionsAgg._count.id || 0,
          disbursementsCount: disbursementsAgg._count.id || 0,
          expensesCount: expenses.length
        },
        expenseByCategory,
        expenses,
        recentPayments,
        recentLoans
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/daybook/expense — Add daily expense
router.post('/expense', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { category, amount, description, paymentMode = 'CASH', date } = req.body;

    if (!category || !amount || !description) {
      return res.status(400).json({ success: false, message: 'Category, amount, and description are required' });
    }

    const expenseDate = date ? new Date(date) : new Date();

    const expense = await prisma.expense.create({
      data: {
        adminId: req.user.id,
        date: expenseDate,
        category: category.toUpperCase(),
        amount: round2(parseFloat(amount)),
        description: description.trim(),
        paymentMode: paymentMode.toUpperCase(),
        createdById: req.user.id
      }
    });

    await auditLog(req.user.id, 'CREATE_EXPENSE', 'Expense', expense.id, {
      category: expense.category,
      amount: expense.amount,
      description: expense.description
    }, req);

    res.status(201).json({ success: true, message: '✓ Expense recorded successfully', data: expense });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/daybook/expense/:id — Delete daily expense
router.delete('/expense/:id', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const expense = await prisma.expense.findUnique({ where: { id: req.params.id } });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    if (expense.adminId !== req.user.id) return res.status(403).json({ success: false, message: 'Access denied' });

    await prisma.expense.delete({ where: { id: req.params.id } });
    await auditLog(req.user.id, 'DELETE_EXPENSE', 'Expense', req.params.id, { amount: expense.amount }, req);

    res.json({ success: true, message: '✓ Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/daybook/opening-balance — Set / adjust opening cash balance
router.post('/opening-balance', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { date, openingBalance, notes } = req.body;
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0);

    const balance = round2(parseFloat(openingBalance) || 0);

    const record = await prisma.dayBookOpeningBalance.upsert({
      where: {
        adminId_date: {
          adminId: req.user.id,
          date: startOfDay
        }
      },
      update: {
        openingBalance: balance,
        notes: notes || undefined,
        updatedAt: new Date()
      },
      create: {
        adminId: req.user.id,
        date: startOfDay,
        openingBalance: balance,
        notes: notes || null
      }
    });

    res.json({ success: true, message: '✓ Opening balance saved', data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
