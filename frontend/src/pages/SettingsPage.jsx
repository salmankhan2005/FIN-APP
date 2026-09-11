import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, AlertOctagon, Edit2, Save, X, Trash2, ShieldAlert, Users, Landmark, RefreshCw, FileText, CreditCard, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { dashboardAPI, usersAPI } from '../services/api';

/* ─── Delete Confirmation Modal ─── */
function DeleteDataModal({ onClose, onDeleted }) {
  const [step, setStep]           = useState('loading'); // loading | preview | confirm | deleting | done
  const [summary, setSummary]     = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError]         = useState('');
  const inputRef = useRef(null);
  const REQUIRED = 'DELETE';

  /* Fetch real-time data counts */
  useEffect(() => {
    dashboardAPI.dataSummary()
      .then(data => { setSummary(data); setStep('preview'); })
      .catch(() => { setError('Failed to load data summary.'); setStep('preview'); });
  }, []);

  useEffect(() => {
    if (step === 'confirm') setTimeout(() => inputRef.current?.focus(), 100);
  }, [step]);

  const handleDelete = async () => {
    if (confirmText !== REQUIRED) return;
    setStep('deleting');
    try {
      const res = await dashboardAPI.resetAllData();
      setStep('done');
      toast.success(res?.message || 'All data deleted successfully.');
      setTimeout(() => { onDeleted(); onClose(); }, 2000);
    } catch (err) {
      toast.error(err.message || 'Deletion failed.');
      setStep('confirm');
    }
  };

  const dataRows = summary ? [
    { icon: Users,     label: 'Customers',        count: summary.customers,  color: '#2563EB' },
    { icon: Landmark,  label: 'Loans',            count: summary.loans,      color: '#7C3AED' },
    { icon: RefreshCw, label: 'Repayment Records',count: summary.repayments, color: '#F59E0B' },
    { icon: CreditCard,label: 'Payment Entries',  count: summary.payments,   color: '#10B981' },
    { icon: FileText,  label: 'Audit Logs',       count: summary.auditLogs,  color: '#64748B' },
  ] : [];

  const totalRecords = summary
    ? (summary.customers + summary.loans + summary.repayments + summary.payments + summary.auditLogs)
    : 0;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget && step !== 'deleting') onClose(); }}
    >
      <div style={{
        width: '100%', maxWidth: 460,
        background: 'var(--bg-card)',
        borderRadius: 20,
        border: '1px solid rgba(239,68,68,0.3)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #991B1B, #DC2626)',
          padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShieldAlert size={20} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>Delete All App Data</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>This action is permanent and irreversible</div>
            </div>
          </div>
          {step !== 'deleting' && step !== 'done' && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', padding: 4 }}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>

          {/* LOADING */}
          {step === 'loading' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px 0' }}>
              <Loader size={28} style={{ color: 'var(--primary-600)', animation: 'spin 1s linear infinite' }} />
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Fetching your data summary...</div>
            </div>
          )}

          {/* PREVIEW — show what will be deleted */}
          {step === 'preview' && (
            <>
              {error && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#DC2626', marginBottom: 16 }}>
                  {error}
                </div>
              )}

              {/* Warning banner */}
              <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 12, padding: '12px 14px', marginBottom: 20, display: 'flex', gap: 10 }}>
                <AlertOctagon size={18} style={{ color: '#DC2626', flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong style={{ color: '#DC2626' }}>Warning:</strong> The following records belonging to your account will be <strong>permanently deleted</strong>. User accounts will be kept. This <strong>cannot be undone</strong>.
                </div>
              </div>

              {/* Data rows */}
              {summary && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {dataRows.map(({ icon: Icon, label, count, color }) => (
                    <div key={label} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 10,
                      border: '1px solid var(--border-subtle)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: color + '15',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icon size={15} style={{ color }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</span>
                      </div>
                      <span style={{
                        fontSize: 14, fontWeight: 700,
                        color: count > 0 ? '#DC2626' : 'var(--text-muted)',
                        background: count > 0 ? 'rgba(239,68,68,0.08)' : 'var(--bg-elevated)',
                        padding: '2px 10px', borderRadius: 8,
                        minWidth: 36, textAlign: 'center',
                      }}>
                        {count.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {/* Total */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'rgba(239,68,68,0.04)',
                    borderRadius: 10,
                    border: '1px solid rgba(239,68,68,0.2)',
                    marginTop: 4,
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>Total Records</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#DC2626' }}>{totalRecords.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-ghost"
                  onClick={onClose}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setStep('confirm')}
                  style={{
                    flex: 1,
                    background: '#DC2626', borderColor: '#B91C1C',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  }}
                  disabled={!!error}
                >
                  <Trash2 size={15} /> Proceed to Delete
                </button>
              </div>
            </>
          )}

          {/* CONFIRM — type DELETE */}
          {step === 'confirm' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(239,68,68,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <ShieldAlert size={26} style={{ color: '#DC2626' }} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Final Confirmation
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Type <strong style={{ color: '#DC2626', fontFamily: 'monospace', fontSize: 14 }}>DELETE</strong> below to permanently erase{' '}
                  <strong>{totalRecords.toLocaleString()} records</strong>.
                </div>
              </div>

              <input
                ref={inputRef}
                type="text"
                className="input"
                placeholder="Type DELETE to confirm"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value.toUpperCase())}
                style={{
                  textAlign: 'center', fontWeight: 700, letterSpacing: 2, fontSize: 15,
                  borderColor: confirmText === REQUIRED ? '#DC2626' : undefined,
                  marginBottom: 16,
                }}
              />

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => setStep('preview')} style={{ flex: 1 }}>
                  ← Back
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleDelete}
                  disabled={confirmText !== REQUIRED}
                  style={{
                    flex: 1,
                    background: confirmText === REQUIRED ? '#DC2626' : '#94A3B8',
                    borderColor: confirmText === REQUIRED ? '#B91C1C' : '#94A3B8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Trash2 size={15} /> Delete Permanently
                </button>
              </div>
            </>
          )}

          {/* DELETING */}
          {step === 'deleting' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0' }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'rgba(239,68,68,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Loader size={28} style={{ color: '#DC2626', animation: 'spin 1s linear infinite' }} />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Deleting all data...</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Please wait. Do not close this window.</div>
            </div>
          )}

          {/* DONE */}
          {step === 'done' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px 0' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(16,185,129,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 28 }}>✓</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#10B981' }}>All data deleted!</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Refreshing app...</div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── Settings Page ─── */
export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    name:  user?.name  || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleSave = async () => {
    try {
      await usersAPI.update(user.id, formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  const handleDeleted = () => {
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="animate-in" style={{ maxWidth: 500, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Profile &amp; Settings</div>
        {!isEditing ? (
          <button className="btn btn-ghost" onClick={() => setIsEditing(true)} style={{ padding: '8px', color: 'var(--primary-600)' }}>
            <Edit2 size={18} />
          </button>
        ) : (
          <button className="btn btn-ghost" onClick={() => setIsEditing(false)} style={{ padding: '8px', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Profile card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px 20px', marginBottom: 16 }}>
        <div className="sidebar-avatar" style={{ width: 80, height: 80, fontSize: 32, fontWeight: 700, marginBottom: 16 }}>
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>

        {isEditing ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left', marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Name</label>
              <input type="text" className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Email</label>
              <input type="email" className="input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Phone</label>
              <input type="text" className="input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10 }}>
              <Save size={16} /> Save Changes
            </button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{user?.email}</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
              <span className="badge badge-info" style={{ fontSize: 11, padding: '4px 10px' }}>Role: {user?.role}</span>
              <span className="badge badge-success" style={{ fontSize: 11, padding: '4px 10px' }}>Status: Active</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', width: '100%', paddingTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>Email</span>
                <span style={{ fontWeight: 600 }}>{user?.email || 'N/A'}</span>
              </div>
              {user?.phone && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Phone</span>
                  <span style={{ fontWeight: 600 }}>{user?.phone}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Sign out */}
      <button
        className="btn btn-primary"
        style={{ width: '100%', background: 'var(--danger-500)', borderColor: 'var(--danger-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 30 }}
        onClick={logout}
      >
        <LogOut size={16} /> Sign Out
      </button>

      {/* Danger Zone */}
      {['ADMIN', 'SUPER_ADMIN'].includes(user?.role) && (
        <div className="card" style={{ padding: '24px', border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#DC2626', fontWeight: 800, fontSize: 16, marginBottom: 6 }}>
            <AlertOctagon size={20} /> Danger Zone
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, lineHeight: 1.5 }}>
            Permanently deletes <strong>all customers, loans, repayments, and payments</strong> linked to your account. User accounts are preserved.
          </div>
          <div style={{ fontSize: 12, color: '#F59E0B', background: 'rgba(245,158,11,0.08)', borderRadius: 8, padding: '8px 12px', marginBottom: 16, border: '1px solid rgba(245,158,11,0.2)' }}>
            ⚠️ A live preview of your data will be shown before deletion.
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', background: '#DC2626', borderColor: '#B91C1C', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={16} /> Delete All App Data
          </button>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteDataModal
          onClose={() => setShowDeleteModal(false)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
