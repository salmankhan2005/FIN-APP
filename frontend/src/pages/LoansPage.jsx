import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loansAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, Eye, Landmark, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const fmtAmt = (v) => (!v && v !== 0) ? '₹0' : `₹${(typeof v === 'number' ? v : parseFloat(v) || 0).toLocaleString('en-IN')}`;

export default function LoansPage() {
  const { isCustomer } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ACTIVE');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loanTypeFilter, setLoanTypeFilter] = useState('ALL');
  const [tenureFilter, setTenureFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_LIMIT = 20;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page to 1 on any filter / search change
  useEffect(() => {
    setPage(1);
  }, [filter, debouncedSearch, tenureFilter]);

  useEffect(() => {
    setLoading(true);
    loansAPI.listWithMeta({
      status: filter || undefined,
      search: debouncedSearch || undefined,
      tenureUnit: tenureFilter || undefined,
      page,
      limit: PAGE_LIMIT,
    })
      .then(r => {
        setLoans(r.data || []);
        setTotalPages(r.meta?.totalPages || 1);
        setTotalCount(r.meta?.total || 0);
      })
      .catch(() => toast.error('Failed to load loans'))
      .finally(() => setLoading(false));
  }, [filter, debouncedSearch, tenureFilter, page]);

  const filteredLoans = loans.filter(l => {
    if (loanTypeFilter !== 'ALL' && l.interestType !== loanTypeFilter) return false;
    return true;
  });

  // Outstanding is pre-computed server-side; fall back gracefully if missing
  const getOutstanding = (loan) => loan.outstandingPrincipal ?? loan.principalAmount ?? 0;

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>{isCustomer ? 'My Loans' : 'Loans'} <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>({totalCount})</span></div>
        {!isCustomer && (
          <Link to="/loans/create" className="btn btn-primary btn-sm"><Plus size={15} /> New</Link>
        )}
      </div>

      {/* Outstanding Summary Pills — Admin/Agent only */}
      {!isCustomer && filter === 'ACTIVE' && loans.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginBottom: 14 }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(59, 130, 246, 0.15)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Regular Flat Interest (வட்டி கடன்)</div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#2563EB' }}>
              {fmtAmt(loans.filter(l => l.interestType === 'FLAT' || !l.interestType).reduce((acc, l) => acc + (l.outstandingPrincipal ?? l.principalAmount), 0))}
            </div>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(16, 185, 129, 0.15)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Deduction Based (கந்து வட்டி)</div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#059669' }}>
              {fmtAmt(loans.filter(l => l.interestType === 'WITHOUT_INTEREST').reduce((acc, l) => acc + (l.outstandingPrincipal ?? l.principalAmount), 0))}
            </div>
          </div>
          <div style={{ background: 'rgba(139, 92, 246, 0.08)', padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(139, 92, 246, 0.15)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>EMI (அசலோடு தவணை)</div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#7C3AED' }}>
              {fmtAmt(loans.filter(l => l.interestType === 'EMI').reduce((acc, l) => acc + (l.outstandingPrincipal ?? l.principalAmount), 0))}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 180, margin: 0 }}>
          <Search size={16} color="var(--text-muted)" />
          <input placeholder={isCustomer ? 'Search your loans...' : 'Search name, phone, loan ID...'} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        
        {/* Loan Type Filter */}
        <div style={{ position: 'relative' }}>
          <select 
            style={{ 
              height: '42px', 
              padding: '0 30px 0 12px', 
              borderRadius: '12px', 
              border: '1px solid var(--border-subtle)', 
              background: 'var(--bg-card)', 
              color: 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 500,
              outline: 'none',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none',
            }} 
            value={loanTypeFilter} 
            onChange={e => setLoanTypeFilter(e.target.value)}
          >
            <option value="ALL">All Loan Types</option>
            <option value="FLAT">Regular Flat Interest (வட்டி கடன்)</option>
            <option value="WITHOUT_INTEREST">Deduction Based (கந்து வட்டி)</option>
            <option value="EMI">EMI (அசலோடு தவணை)</option>
          </select>
          <ChevronDown 
            size={15} 
            color="var(--text-muted)" 
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} 
          />
        </div>

        {/* Tenure Filter */}
        <div style={{ position: 'relative' }}>
          <select 
            style={{ 
              height: '42px', 
              padding: '0 30px 0 12px', 
              borderRadius: '12px', 
              border: '1px solid var(--border-subtle)', 
              background: 'var(--bg-card)', 
              color: 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 500,
              outline: 'none',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none',
            }} 
            value={tenureFilter} 
            onChange={e => setTenureFilter(e.target.value)}
          >
            <option value="">All Tenure</option>
            <option value="DAYS">Daily Loans</option>
            <option value="WEEKS">Weekly Loans</option>
            <option value="MONTHS">Monthly Loans</option>
          </select>
          <ChevronDown 
            size={15} 
            color="var(--text-muted)" 
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} 
          />
        </div>
      </div>

      {/* Filter tabs — Admin/Agent only */}
      {!isCustomer && (
        <div className="tabs">
          {[['ACTIVE', 'Active'], ['', 'All'], ['CLOSED', 'Closed'], ['DEFAULTED', 'Defaulted']].map(([val, label]) => (
            <button key={val} className={`tab ${filter === val ? 'active' : ''}`} onClick={() => setFilter(val)}>{label}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
          <div className="spinner" />
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 16px' }}>
          <Landmark size={36} style={{ opacity: 0.3, marginBottom: 8 }} />
          <div style={{ fontWeight: 600 }}>No loans found</div>
        </div>
      ) : (
        filteredLoans.map(loan => {
          const type = loan.interestType || 'FLAT';
          const outstanding = getOutstanding(loan);
          return (
            <div key={loan.id} className="collection-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="sidebar-avatar" style={{ width: 36, height: 36, fontSize: 13 }}>{loan.customer?.name?.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{loan.customer?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{loan.loanNumber} · {loan.tenureUnit === 'WEEKS' ? 'Weekly' : loan.tenureUnit === 'MONTHS' ? 'Monthly' : 'Daily'}</div>
                  </div>
                </div>
                <span className={`badge ${loan.status === 'ACTIVE' ? 'badge-success' : loan.status === 'CLOSED' ? 'badge-info' : 'badge-danger'}`}>{loan.status}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{loan.interestType === 'WITHOUT_INTEREST' ? 'TOTAL REPAYABLE' : 'PRINCIPAL'}</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{fmtAmt(loan.principalAmount)}</div>
                  {loan.interestType === 'WITHOUT_INTEREST' && (
                    <div style={{ fontSize: 10, color: 'var(--accent-600)', marginTop: 2 }}>
                      Disbursed: {fmtAmt(loan.principalAmount - (loan.processingFee || 0))}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{loan.interestType === 'WITHOUT_INTEREST' ? (loan.tenureUnit === 'DAYS' ? 'DAILY DUE' : 'WEEKLY DUE') : 'INTEREST/PERIOD'}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--accent-600)' }}>₹{loan.installmentAmount?.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>OUTSTANDING</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: outstanding > 0 ? 'var(--warning-600)' : 'var(--accent-600)' }}>{fmtAmt(outstanding)}</div>
                </div>
              </div>

              {/* Progress bar (use repaymentProgress if available) */}
              <div style={{ height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 2, marginBottom: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${loan.repaymentProgress ?? 0}%`, background: (loan.repaymentProgress ?? 0) === 100 ? 'var(--accent-500)' : 'var(--primary-500)', borderRadius: 2 }} />
              </div>

              <Link to={`/loans/${loan.id}`} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                <Eye size={13} /> View Details
              </Link>
            </div>
          );
        })
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
          <button
            className="btn btn-ghost btn-sm"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            style={{ fontWeight: 600, opacity: page <= 1 ? 0.4 : 1 }}
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
              acc.push(p);
              return acc;
            }, [])
            .map((item, idx) =>
              item === '...' ? (
                <span key={`ellipsis-${idx}`} style={{ color: 'var(--text-muted)', fontSize: 13, padding: '0 4px' }}>…</span>
              ) : (
                <button
                  key={item}
                  className={`btn btn-sm ${item === page ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setPage(item)}
                  style={{ minWidth: 36, fontWeight: item === page ? 700 : 500 }}
                >
                  {item}
                </button>
              )
            )
          }
          <button
            className="btn btn-ghost btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            style={{ fontWeight: 600, opacity: page >= totalPages ? 0.4 : 1 }}
          >
            Next →
          </button>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
            Page {page} of {totalPages}
          </span>
        </div>
      )}
    </div>
  );
}
