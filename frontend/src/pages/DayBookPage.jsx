import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { daybookAPI } from '../services/api';
import {
  BookOpen, Calendar, Plus, Trash2, IndianRupee, ArrowDownLeft, ArrowUpRight,
  Receipt, Wallet, RefreshCw, CheckCircle, FileSpreadsheet, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

function fmt(val) {
  if (!val && val !== 0) return '₹0';
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '₹0';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function DayBookPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Opening balance edit modal state
  const [showOpeningModal, setShowOpeningModal] = useState(false);
  const [openingInput, setOpeningInput] = useState('');
  const [openingNotes, setOpeningNotes] = useState('');
  const [savingOpening, setSavingOpening] = useState(false);

  // Expense modal state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState('PETROL');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expensePaymentMode, setExpensePaymentMode] = useState('CASH');
  const [savingExpense, setSavingExpense] = useState(false);

  const fetchDayBook = useCallback(async () => {
    try {
      setLoading(true);
      const res = await daybookAPI.get({ date: selectedDate });
      setData(res);
      setOpeningInput(res.openingBalance || '');
      setOpeningNotes(res.openingNotes || '');
    } catch (err) {
      toast.error(err.message || 'Failed to load Day Book');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchDayBook();
  }, [fetchDayBook]);

  const handleSaveOpeningBalance = async (e) => {
    e.preventDefault();
    try {
      setSavingOpening(true);
      await daybookAPI.setOpeningBalance({
        date: selectedDate,
        openingBalance: parseFloat(openingInput) || 0,
        notes: openingNotes
      });
      toast.success('Opening balance updated');
      setShowOpeningModal(false);
      fetchDayBook();
    } catch (err) {
      toast.error(err.message || 'Failed to save opening balance');
    } finally {
      setSavingOpening(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseAmount || parseFloat(expenseAmount) <= 0) {
      toast.error('Please enter a valid expense amount');
      return;
    }
    if (!expenseDesc.trim()) {
      toast.error('Please enter expense description');
      return;
    }

    try {
      setSavingExpense(true);
      await daybookAPI.addExpense({
        date: selectedDate,
        category: expenseCategory,
        amount: parseFloat(expenseAmount),
        description: expenseDesc,
        paymentMode: expensePaymentMode
      });
      toast.success('Expense recorded');
      setShowExpenseModal(false);
      setExpenseAmount('');
      setExpenseDesc('');
      fetchDayBook();
    } catch (err) {
      toast.error(err.message || 'Failed to add expense');
    } finally {
      setSavingExpense(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Delete this expense entry?')) return;
    try {
      await daybookAPI.deleteExpense(id);
      toast.success('Expense deleted');
      fetchDayBook();
    } catch (err) {
      toast.error(err.message || 'Failed to delete expense');
    }
  };

  const summary = data?.summary || {
    openingBalance: 0,
    collectionsTotal: 0,
    processingFeesTotal: 0,
    disbursementsTotal: 0,
    expensesTotal: 0,
    closingBalance: 0,
    netCashFlow: 0
  };

  return (
    <div className="page-container" style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        marginBottom: 24
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}>
              <BookOpen size={22} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Day Book (நாட்குறிப்பு)</h1>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary, #64748b)' }}>
                Daily Cash Ledger & Closing Cash In Hand
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--card-bg, #fff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: 10,
            padding: '6px 12px'
          }}>
            <Calendar size={16} color="#6366f1" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                fontWeight: 600,
                background: 'transparent',
                color: 'inherit'
              }}
            />
          </div>

          <button
            onClick={() => setShowExpenseModal(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', padding: '8px 14px' }}
          >
            <Plus size={16} /> Add Expense
          </button>

          <button
            onClick={fetchDayBook}
            className="btn btn-secondary"
            style={{ padding: '8px 12px' }}
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Primary KPI Card: Closing Balance */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        color: '#fff',
        borderRadius: 16,
        padding: '24px',
        marginBottom: 24,
        boxShadow: '0 10px 25px -5px rgba(67, 56, 202, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c7d2fe', fontWeight: 700 }}>
              Closing Cash In Hand (கையில் உள்ள ரொக்கம்)
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, marginTop: 4, letterSpacing: '-0.02em' }}>
              {fmt(summary.closingBalance)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: '12.5px', color: '#e0e7ff' }}>
              <span>Opening: {fmt(summary.openingBalance)}</span>
              <span>•</span>
              <span style={{ color: summary.netCashFlow >= 0 ? '#4ade80' : '#f87171', fontWeight: 700 }}>
                Net Flow: {summary.netCashFlow >= 0 ? '+' : ''}{fmt(summary.netCashFlow)}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowOpeningModal(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#fff',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)'
            }}
          >
            Edit Opening Cash
          </button>
        </div>
      </div>

      {/* Equation Breakdown Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 14,
        marginBottom: 24
      }}>
        {/* 1. Opening Cash */}
        <div className="stat-card" style={{ padding: 16, borderLeft: '4px solid #6366f1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6366f1', fontSize: '12px', fontWeight: 700 }}>
            <Wallet size={16} /> Opening Balance
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 6 }}>{fmt(summary.openingBalance)}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>Start of day cash</div>
        </div>

        {/* 2. Cash Inflow: Collections */}
        <div className="stat-card" style={{ padding: 16, borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: '12px', fontWeight: 700 }}>
            <ArrowDownLeft size={16} /> + Collections
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 6, color: '#10b981' }}>{fmt(summary.collectionsTotal)}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>{data?.collections?.length || 0} installments paid</div>
        </div>

        {/* 3. Cash Inflow: Fees */}
        <div className="stat-card" style={{ padding: 16, borderLeft: '4px solid #06b6d4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#06b6d4', fontSize: '12px', fontWeight: 700 }}>
            <Receipt size={16} /> + Processing Fees
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 6, color: '#06b6d4' }}>{fmt(summary.processingFeesTotal)}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>From new loans</div>
        </div>

        {/* 4. Cash Outflow: Disbursed */}
        <div className="stat-card" style={{ padding: 16, borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f59e0b', fontSize: '12px', fontWeight: 700 }}>
            <ArrowUpRight size={16} /> - Loans Disbursed
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 6, color: '#f59e0b' }}>{fmt(summary.disbursementsTotal)}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>{data?.disbursements?.length || 0} loans issued</div>
        </div>

        {/* 5. Cash Outflow: Expenses */}
        <div className="stat-card" style={{ padding: 16, borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontSize: '12px', fontWeight: 700 }}>
            <Trash2 size={16} /> - Office Expenses
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: 6, color: '#ef4444' }}>{fmt(summary.expensesTotal)}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>{data?.expenses?.length || 0} entries logged</div>
        </div>
      </div>

      {/* Two Column Detailed Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
        {/* Left: Collections Received Today */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ArrowDownLeft size={18} color="#10b981" /> Collections Received
            </h2>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', background: '#d1fae5', padding: '3px 8px', borderRadius: 6 }}>
              {data?.collections?.length || 0} Payments
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: '#94a3b8' }}>Loading collections...</div>
          ) : !data?.collections?.length ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              No collections recorded on this date.
            </div>
          ) : (
            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              {data.collections.map((c) => (
                <div key={c.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border-color, #f1f5f9)'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{c.customerName}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Loan: {c.loanNumber} • By: {c.collectedBy} • {new Date(c.collectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#10b981', fontSize: '14px' }}>
                    +{fmt(c.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Daily Office Expenses & Deductions */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Receipt size={18} color="#ef4444" /> Daily Expenses (செலவுகள்)
            </h2>
            <button
              onClick={() => setShowExpenseModal(true)}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#6366f1',
                background: '#e0e7ff',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 6,
                cursor: 'pointer'
              }}
            >
              + Add
            </button>
          </div>

          {loading ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: '#94a3b8' }}>Loading expenses...</div>
          ) : !data?.expenses?.length ? (
            <div style={{ padding: '30px 0', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              No expenses recorded for this date.
            </div>
          ) : (
            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              {data.expenses.map((e) => (
                <div key={e.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border-color, #f1f5f9)'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: '#fee2e2',
                        color: '#b91c1c'
                      }}>
                        {e.category}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>{e.description}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: 2 }}>
                      Mode: {e.paymentMode} • Logged by: {e.createdBy}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 800, color: '#ef4444', fontSize: '14px' }}>
                      -{fmt(e.amount)}
                    </span>
                    <button
                      onClick={() => handleDeleteExpense(e.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: 4
                      }}
                      title="Delete expense"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Opening Balance Modal */}
      {showOpeningModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div className="card" style={{ maxWidth: 420, width: '100%', padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800 }}>Set Opening Balance</h3>
            <form onSubmit={handleSaveOpeningBalance}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: 6 }}>
                  Opening Cash Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={openingInput}
                  onChange={(e) => setOpeningInput(e.target.value)}
                  placeholder="e.g. 25000"
                  className="form-control"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: 6 }}>
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={openingNotes}
                  onChange={(e) => setOpeningNotes(e.target.value)}
                  placeholder="e.g. Cash carried over from safe"
                  className="form-control"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowOpeningModal(false)}
                  className="btn btn-secondary"
                  disabled={savingOpening}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingOpening}
                >
                  {savingOpening ? 'Saving...' : 'Save Balance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}>
          <div className="card" style={{ maxWidth: 440, width: '100%', padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800 }}>Record Daily Office Expense</h3>
            <form onSubmit={handleAddExpense}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: 6 }}>
                  Category (பிரிவு)
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="form-control"
                  style={{ width: '100%' }}
                >
                  <option value="PETROL">Petrol / Fuel (பெட்ரோல்)</option>
                  <option value="TEA_SNACKS">Tea & Refreshments (டீ / காபி)</option>
                  <option value="RENT">Office Rent (வாடகை)</option>
                  <option value="SALARY">Salary / Advance (சம்பளம்)</option>
                  <option value="COMMISSION">Agent Commission (கமிஷன்)</option>
                  <option value="STATIONERY">Stationery & Printing</option>
                  <option value="MAINTENANCE">Maintenance / Repairs</option>
                  <option value="OTHER">Other Expenses</option>
                </select>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: 6 }}>
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="e.g. 250"
                  className="form-control"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: 6 }}>
                  Description / Reason
                </label>
                <input
                  type="text"
                  required
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="e.g. Collection agent bike fuel"
                  className="form-control"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: 6 }}>
                  Payment Mode
                </label>
                <select
                  value={expensePaymentMode}
                  onChange={(e) => setExpensePaymentMode(e.target.value)}
                  className="form-control"
                  style={{ width: '100%' }}
                >
                  <option value="CASH">Cash In Hand</option>
                  <option value="UPI">UPI / Online</option>
                  <option value="BANK">Bank Transfer</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="btn btn-secondary"
                  disabled={savingExpense}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingExpense}
                >
                  {savingExpense ? 'Recording...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
