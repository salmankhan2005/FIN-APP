import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { settlementsAPI, usersAPI } from '../services/api';
import {
  Banknote, Users, Calendar, CheckCircle2, AlertTriangle, Clock,
  ShieldCheck, ArrowRight, RefreshCw, KeyRound, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

function fmt(val) {
  if (!val && val !== 0) return '₹0';
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) return '₹0';
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export default function CashSettlementPage() {
  const { user, isAdmin } = useAuth();
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Settlement summary state
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Form input states
  const [fuelExpense, setFuelExpense] = useState('');
  const [commission, setCommission] = useState('');
  const [otherDeductions, setOtherDeductions] = useState('');
  const [actualCashReceived, setActualCashReceived] = useState('');
  const [signOffOtp, setSignOffOtp] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // History list
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch agents
  useEffect(() => {
    usersAPI.list({ role: 'AGENT' })
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.users || []);
        setAgents(list);
        if (list.length > 0 && !selectedAgentId) {
          setSelectedAgentId(list[0].id);
        }
      })
      .catch(console.error);
  }, []);

  // Fetch today summary for selected agent
  const fetchSummary = useCallback(async () => {
    if (!selectedAgentId) return;
    try {
      setLoadingSummary(true);
      const res = await settlementsAPI.todaySummary({
        agentId: selectedAgentId,
        date: selectedDate
      });
      setSummary(res);
      // Pre-fill actual cash received to expected cash if empty
      if (!actualCashReceived) {
        setActualCashReceived(res.totalCollected || '');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to calculate agent collections');
    } finally {
      setLoadingSummary(false);
    }
  }, [selectedAgentId, selectedDate]);

  // Fetch settlement history
  const fetchHistory = useCallback(async () => {
    try {
      setLoadingHistory(true);
      const res = await settlementsAPI.list({ limit: 20 });
      setHistory(Array.isArray(res) ? res : (res?.settlements || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Real-time calculation of expected cash due & difference
  const totalCollected = summary?.totalCollected || 0;
  const fExpense = parseFloat(fuelExpense) || 0;
  const comm = parseFloat(commission) || 0;
  const otherDed = parseFloat(otherDeductions) || 0;
  const totalDeductions = fExpense + comm + otherDed;
  const expectedCashDue = Math.max(0, totalCollected - totalDeductions);
  const receivedCash = parseFloat(actualCashReceived) || 0;
  const diff = receivedCash - expectedCashDue;

  const handleCloseSettlement = async (e) => {
    e.preventDefault();
    if (!selectedAgentId) {
      toast.error('Please select an agent');
      return;
    }
    if (summary?.isAlreadySettled) {
      toast.error('A settlement record already exists for this agent on this date');
      return;
    }

    try {
      setSubmitting(true);
      await settlementsAPI.close({
        agentId: selectedAgentId,
        settlementDate: selectedDate,
        fuelExpense: fExpense,
        commission: comm,
        otherDeductions: otherDed,
        actualCashReceived: receivedCash,
        signOffOtp,
        notes
      });

      toast.success('Cash settlement verified and locked for the day!');
      // Reset form
      setFuelExpense('');
      setCommission('');
      setOtherDeductions('');
      setActualCashReceived('');
      setSignOffOtp('');
      setNotes('');
      fetchSummary();
      fetchHistory();
    } catch (err) {
      toast.error(err.message || 'Failed to submit cash settlement');
    } finally {
      setSubmitting(false);
    }
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            <Banknote size={22} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Evening Cash Handover (மாலை ஒப்படைப்பு)</h1>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary, #64748b)' }}>
              Agent Physical Cash Reconciliation & Day-Close Sign-off
            </p>
          </div>
        </div>

        {/* Date & Agent Controls */}
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
            <Users size={16} color="#10b981" />
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                fontWeight: 600,
                background: 'transparent',
                color: 'inherit'
              }}
            >
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.phone})</option>
              ))}
            </select>
          </div>

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
            onClick={fetchSummary}
            className="btn btn-secondary"
            style={{ padding: '8px 12px' }}
            title="Refresh"
          >
            <RefreshCw size={15} className={loadingSummary ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Reconciliation Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, marginBottom: 28 }}>
        {/* Left Card: System Calculation & Collection Breakdown */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
              1. System Collection Details
            </h2>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              background: '#ecfdf5',
              color: '#059669'
            }}>
              {summary?.collectionCount || 0} Collections Today
            </span>
          </div>

          {/* Big Amount Due Display */}
          <div style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
            color: '#fff',
            borderRadius: 12,
            padding: '20px',
            marginBottom: 20
          }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a7f3d0' }}>
              Calculated Net Cash Due (வரவேண்டிய ரொக்கம்)
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, marginTop: 4 }}>
              {fmt(expectedCashDue)}
            </div>
            <div style={{ fontSize: '12px', color: '#d1fae5', marginTop: 6 }}>
              Total Collected ({fmt(totalCollected)}) - Deductions ({fmt(totalDeductions)})
            </div>
          </div>

          {/* Line Item Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Gross Cash Collected:</span>
              <span style={{ fontWeight: 700, color: '#10b981' }}>{fmt(totalCollected)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Fuel / Travel Expense:</span>
              <span style={{ fontWeight: 700, color: '#ef4444' }}>-{fmt(fExpense)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Agent Commission:</span>
              <span style={{ fontWeight: 700, color: '#ef4444' }}>-{fmt(comm)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Other Allowed Deductions:</span>
              <span style={{ fontWeight: 700, color: '#ef4444' }}>-{fmt(otherDed)}</span>
            </div>
          </div>

          {summary?.isAlreadySettled && (
            <div style={{
              marginTop: 'auto',
              padding: '12px',
              borderRadius: 8,
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <CheckCircle2 size={18} color="#059669" />
              <span><strong>Settled & Locked:</strong> This agent batch was closed for this date.</span>
            </div>
          )}
        </div>

        {/* Right Card: Admin Physical Cash Verification & Sign-off Form */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 16px' }}>
            2. Physical Cash Verification & Sign-off
          </h2>

          <form onSubmit={handleCloseSettlement}>
            {/* Deductions inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: 4 }}>
                  Fuel / Petrol Expense (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={fuelExpense}
                  onChange={(e) => setFuelExpense(e.target.value)}
                  placeholder="0.00"
                  className="form-control"
                  style={{ width: '100%' }}
                  disabled={summary?.isAlreadySettled}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: 4 }}>
                  Commission (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  placeholder="0.00"
                  className="form-control"
                  style={{ width: '100%' }}
                  disabled={summary?.isAlreadySettled}
                />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: 4 }}>
                Other Deductions / Tea (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={otherDeductions}
                onChange={(e) => setOtherDeductions(e.target.value)}
                placeholder="0.00"
                className="form-control"
                style={{ width: '100%' }}
                disabled={summary?.isAlreadySettled}
              />
            </div>

            {/* Actual physical cash received */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                Actual Physical Cash Received in Hand (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={actualCashReceived}
                onChange={(e) => setActualCashReceived(e.target.value)}
                placeholder="0.00"
                className="form-control"
                style={{ width: '100%', fontSize: '15px', fontWeight: 700, borderColor: diff === 0 ? '#10b981' : '#f59e0b' }}
                disabled={summary?.isAlreadySettled}
              />
            </div>

            {/* Live Difference / Match Alert */}
            <div style={{
              padding: '10px 14px',
              borderRadius: 8,
              marginBottom: 16,
              fontSize: '12.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: Math.abs(diff) < 0.01 ? '#ecfdf5' : diff < 0 ? '#fee2e2' : '#fef3c7',
              color: Math.abs(diff) < 0.01 ? '#065f46' : diff < 0 ? '#991b1b' : '#92400e',
              border: `1px solid ${Math.abs(diff) < 0.01 ? '#a7f3d0' : diff < 0 ? '#fca5a5' : '#fde68a'}`
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {Math.abs(diff) < 0.01 ? <Check size={16} /> : <AlertTriangle size={16} />}
                {Math.abs(diff) < 0.01 ? 'Cash Matches Perfectly' : diff < 0 ? 'Cash Shortage (குறைவு)' : 'Cash Excess (கூடுதல்)'}
              </span>
              <span style={{ fontWeight: 800 }}>
                {diff >= 0 ? '+' : ''}{fmt(diff)}
              </span>
            </div>

            {/* OTP / Sign-off & Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: 4 }}>
                  Admin PIN / OTP (Sign-off)
                </label>
                <input
                  type="password"
                  value={signOffOtp}
                  onChange={(e) => setSignOffOtp(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  className="form-control"
                  style={{ width: '100%' }}
                  disabled={summary?.isAlreadySettled}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, marginBottom: 4 }}>
                  Notes / Remarks
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional remarks (e.g. Verified & closed)"
                  className="form-control"
                  style={{ width: '100%' }}
                  disabled={summary?.isAlreadySettled}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || summary?.isAlreadySettled}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: summary?.isAlreadySettled ? '#94a3b8' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
              }}
            >
              <ShieldCheck size={18} />
              {submitting ? 'Verifying...' : summary?.isAlreadySettled ? 'Batch Already Settled' : 'Verify & Lock Handover'}
            </button>
          </form>
        </div>
      </div>

      {/* Recent Handover History */}
      <div className="card" style={{ padding: 20 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 14px' }}>
          Recent Settlement History (கடந்த ஒப்படைப்புகள்)
        </h2>

        {loadingHistory ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8' }}>Loading settlement history...</div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', fontSize: '13px' }}>
            No settlement records found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color, #e2e8f0)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 8px' }}>Date</th>
                  <th style={{ padding: '10px 8px' }}>Agent</th>
                  <th style={{ padding: '10px 8px' }}>Collected</th>
                  <th style={{ padding: '10px 8px' }}>Deductions</th>
                  <th style={{ padding: '10px 8px' }}>Expected Cash</th>
                  <th style={{ padding: '10px 8px' }}>Received</th>
                  <th style={{ padding: '10px 8px' }}>Difference</th>
                  <th style={{ padding: '10px 8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map(s => {
                  const totalDed = (s.fuelExpense || 0) + (s.commission || 0) + (s.otherDeductions || 0);
                  const isBalanced = Math.abs(s.difference || 0) < 0.01;
                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>
                        {new Date(s.settlementDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '10px 8px' }}>{s.agent?.name || 'Agent'}</td>
                      <td style={{ padding: '10px 8px', color: '#10b981', fontWeight: 700 }}>{fmt(s.totalCollected)}</td>
                      <td style={{ padding: '10px 8px', color: '#ef4444' }}>-{fmt(totalDed)}</td>
                      <td style={{ padding: '10px 8px', fontWeight: 700 }}>{fmt(s.expectedCash)}</td>
                      <td style={{ padding: '10px 8px', fontWeight: 800 }}>{fmt(s.actualCashReceived)}</td>
                      <td style={{
                        padding: '10px 8px',
                        fontWeight: 700,
                        color: isBalanced ? '#10b981' : s.difference < 0 ? '#ef4444' : '#f59e0b'
                      }}>
                        {s.difference >= 0 ? '+' : ''}{fmt(s.difference)}
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: s.status === 'SETTLED' ? '#ecfdf5' : '#fee2e2',
                          color: s.status === 'SETTLED' ? '#059669' : '#b91c1c'
                        }}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
