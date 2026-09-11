import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  LogOut,
  AlertOctagon,
  Edit2,
  Save,
  X,
  Trash2,
  ShieldAlert,
  Users,
  Landmark,
  RefreshCw,
  FileText,
  CreditCard,
  Loader,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Database,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { dashboardAPI, usersAPI } from '../services/api';
import { exportFullDataToExcel } from '../utils/excelExport';

/* ─── Delete Confirmation & Data Extraction Modal ─── */
function DeleteDataModal({ onClose, onDeleted }) {
  const [step, setStep]                 = useState('loading'); // loading | preview | confirm | deleting | done
  const [summary, setSummary]           = useState(null);
  const [confirmText, setConfirmText]   = useState('');
  const [error, setError]               = useState('');
  const [isExporting, setIsExporting]   = useState(false);
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

  const handleExportExcel = async () => {
    setIsExporting(true);
    const toastId = toast.loading('Extracting data & generating Excel sheet...');
    try {
      const exportRes = await dashboardAPI.exportData();
      if (!exportRes) {
        throw new Error('No data received from server');
      }
      exportFullDataToExcel(exportRes);
      toast.success('Excel workbook downloaded successfully! 📊', { id: toastId });
    } catch (err) {
      console.error('Export error:', err);
      toast.error(err.message || 'Failed to export data to Excel.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

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
    { icon: Users,     label: 'Customers',        count: summary.customers,  color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
    { icon: Landmark,  label: 'Loans',            count: summary.loans,      color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
    { icon: RefreshCw, label: 'Repayment Records',count: summary.repayments, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
    { icon: CreditCard,label: 'Payment Entries',  count: summary.payments,   color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
    { icon: FileText,  label: 'Audit Logs',       count: summary.auditLogs,  color: '#64748B', bg: 'rgba(100,116,139,0.08)' },
  ] : [];

  const totalRecords = summary
    ? (summary.customers + summary.loans + summary.repayments + summary.payments + summary.auditLogs)
    : 0;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '12px 10px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && step !== 'deleting') onClose(); }}
    >
      <div style={{
        width: '100%',
        maxWidth: 440,
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-card, #ffffff)',
        borderRadius: 20,
        border: '1px solid rgba(239, 68, 68, 0.35)',
        boxShadow: '0 25px 60px -15px rgba(220, 38, 38, 0.3)',
        overflow: 'hidden',
        animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Sticky Header */}
        <div style={{
          background: 'linear-gradient(135deg, #991B1B 0%, #DC2626 100%)',
          padding: '16px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <ShieldAlert size={20} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>Delete All App Data</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 }}>Permanent &amp; Irreversible Action</div>
            </div>
          </div>
          {step !== 'deleting' && step !== 'done' && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                color: 'white',
                width: 30, height: 30,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Scrollable Body */}
        <div style={{
          padding: '16px 18px',
          overflowY: 'auto',
          flex: 1,
          WebkitOverflowScrolling: 'touch',
        }}>

          {/* LOADING */}
          {step === 'loading' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '32px 0' }}>
              <Loader size={30} style={{ color: '#DC2626', animation: 'spin 1s linear infinite' }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Fetching live data summary...</div>
            </div>
          )}

          {/* PREVIEW */}
          {step === 'preview' && (
            <>
              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 12, padding: '10px 14px',
                  fontSize: 12.5, color: '#DC2626', marginBottom: 12
                }}>
                  {error}
                </div>
              )}

              {/* 📥 Excel Extract & Backup Banner (High Priority Feature) */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.12) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 14,
                padding: '12px 14px',
                marginBottom: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <FileSpreadsheet size={18} style={{ color: '#059669', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#065F46' }}>
                    Backup Data to Excel (.xlsx)
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary, #475569)', lineHeight: 1.4, marginBottom: 10 }}>
                  Extract all records into formatted multi-sheet Excel with highlighted columns before deleting.
                </div>
                <button
                  type="button"
                  onClick={handleExportExcel}
                  disabled={isExporting}
                  style={{
                    width: '100%',
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '9px 12px',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: isExporting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
                    transition: 'all 0.2s',
                  }}
                >
                  {isExporting ? (
                    <>
                      <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Generating Excel File...</span>
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      <span>Extract &amp; Download Excel Sheet</span>
                    </>
                  )}
                </button>
              </div>

              {/* Warning Notice */}
              <div style={{
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 12,
                padding: '10px 12px',
                marginBottom: 14,
                display: 'flex',
                gap: 8,
              }}>
                <AlertOctagon size={16} style={{ color: '#DC2626', flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  <strong style={{ color: '#DC2626' }}>Warning:</strong> The following records belonging to your account will be <strong>permanently deleted</strong>. User logins will be kept.
                </div>
              </div>

              {/* Mobile-Optimized Data Summary Rows */}
              {summary && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  {dataRows.map(({ icon: Icon, label, count, color, bg }) => (
                    <div key={label} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--bg-elevated, #F8FAFC)',
                      borderRadius: 10,
                      border: '1px solid var(--border-subtle, rgba(0,0,0,0.05))',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 7,
                          background: bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Icon size={14} style={{ color }} />
                        </div>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
                      </div>
                      <span style={{
                        fontSize: 13, fontWeight: 700,
                        color: count > 0 ? '#DC2626' : 'var(--text-muted)',
                        background: count > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(0,0,0,0.03)',
                        padding: '2px 8px', borderRadius: 6,
                        minWidth: 32, textAlign: 'center',
                      }}>
                        {count.toLocaleString()}
                      </span>
                    </div>
                  ))}

                  {/* Total Record Summary */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '9px 12px',
                    background: 'rgba(239,68,68,0.06)',
                    borderRadius: 10,
                    border: '1px solid rgba(239,68,68,0.25)',
                    marginTop: 2,
                  }}>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: '#DC2626' }}>Total Records</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#DC2626' }}>{totalRecords.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    fontSize: 13,
                    padding: '10px 14px',
                    borderRadius: 10,
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setStep('confirm')}
                  disabled={!!error}
                  style={{
                    flex: 1.2,
                    background: '#DC2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontSize: 13,
                    fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    cursor: error ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
                  }}
                >
                  <Trash2 size={14} /> Proceed to Delete
                </button>
              </div>
            </>
          )}

          {/* CONFIRM STEP */}
          {step === 'confirm' && (
            <>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: '50%',
                  background: 'rgba(239,68,68,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 10px',
                }}>
                  <ShieldAlert size={24} style={{ color: '#DC2626' }} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Final Confirmation
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Type <strong style={{ color: '#DC2626', fontFamily: 'monospace', fontSize: 13 }}>DELETE</strong> below to permanently erase{' '}
                  <strong>{totalRecords.toLocaleString()} records</strong>.
                </div>
              </div>

              <input
                ref={inputRef}
                type="text"
                className="input"
                placeholder="Type DELETE"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value.toUpperCase())}
                style={{
                  textAlign: 'center', fontWeight: 800, letterSpacing: 3, fontSize: 15,
                  borderColor: confirmText === REQUIRED ? '#DC2626' : undefined,
                  boxShadow: confirmText === REQUIRED ? '0 0 0 3px rgba(239,68,68,0.15)' : undefined,
                  marginBottom: 14,
                  height: 44,
                  borderRadius: 10,
                }}
              />

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setStep('preview')}
                  style={{ flex: 1, fontSize: 13, borderRadius: 10 }}
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={confirmText !== REQUIRED}
                  style={{
                    flex: 1.4,
                    background: confirmText === REQUIRED ? '#DC2626' : 'var(--text-muted, #94A3B8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontSize: 13,
                    fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    cursor: confirmText === REQUIRED ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Trash2 size={14} /> Delete Permanently
                </button>
              </div>
            </>
          )}

          {/* DELETING */}
          {step === 'deleting' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '24px 0' }}>
              <div style={{
                width: 54, height: 54, borderRadius: '50%',
                background: 'rgba(239,68,68,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Loader size={26} style={{ color: '#DC2626', animation: 'spin 1s linear infinite' }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Deleting all data...</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Please wait. Do not close this window.</div>
            </div>
          )}

          {/* DONE */}
          {step === 'done' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 0' }}>
              <div style={{
                width: 50, height: 50, borderRadius: '50%',
                background: 'rgba(16,185,129,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CheckCircle2 size={26} style={{ color: '#10B981' }} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>All data deleted!</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Refreshing app...</div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ─── Settings Page ─── */
export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isGlobalExporting, setIsGlobalExporting] = useState(false);
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

  const handleDirectExcelExport = async () => {
    setIsGlobalExporting(true);
    const toastId = toast.loading('Extracting full database & preparing Excel workbook...');
    try {
      const exportRes = await dashboardAPI.exportData();
      if (!exportRes) {
        throw new Error('No data received from server');
      }
      exportFullDataToExcel(exportRes);
      toast.success('Excel workbook exported successfully! 📊', { id: toastId });
    } catch (err) {
      console.error('Export error:', err);
      toast.error(err.message || 'Failed to export Excel file.', { id: toastId });
    } finally {
      setIsGlobalExporting(false);
    }
  };

  return (
    <div className="animate-in" style={{ maxWidth: 520, margin: '0 auto', paddingBottom: 40, paddingLeft: 8, paddingRight: 8 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Profile &amp; Settings</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Manage your account and database</div>
        </div>
        {!isEditing ? (
          <button className="btn btn-ghost" onClick={() => setIsEditing(true)} style={{ padding: '8px', color: 'var(--primary-600)' }} aria-label="Edit Profile">
            <Edit2 size={18} />
          </button>
        ) : (
          <button className="btn btn-ghost" onClick={() => setIsEditing(false)} style={{ padding: '8px', color: 'var(--text-muted)' }} aria-label="Cancel Edit">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Profile card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 18px', marginBottom: 16 }}>
        <div className="sidebar-avatar" style={{ width: 72, height: 72, fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>

        {isEditing ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left', marginBottom: 12 }}>
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
            <button className="btn btn-primary" onClick={handleSave} style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 6 }}>
              <Save size={16} /> Save Changes
            </button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 3 }}>{user?.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 10 }}>{user?.email}</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              <span className="badge badge-info" style={{ fontSize: 11, padding: '3px 10px' }}>Role: {user?.role}</span>
              <span className="badge badge-success" style={{ fontSize: 11, padding: '3px 10px' }}>Status: Active</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', width: '100%', paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12.5 }}>
                <span style={{ color: 'var(--text-muted)' }}>Email</span>
                <span style={{ fontWeight: 600 }}>{user?.email || 'N/A'}</span>
              </div>
              {user?.phone && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Phone</span>
                  <span style={{ fontWeight: 600 }}>{user?.phone}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 📊 Data Extract & Excel Backup Section */}
      {['ADMIN', 'SUPER_ADMIN'].includes(user?.role) && (
        <div className="card" style={{
          padding: '18px',
          marginBottom: 16,
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(5, 150, 105, 0.08) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
            <FileSpreadsheet size={19} /> Data Extraction &amp; Excel Backup
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.45 }}>
            Export all application records into a structured Excel (.xlsx) workbook with dedicated sheets and highlighted columns:
          </div>

          {/* Sheet Preview Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {[
              { name: 'Summary', color: '#059669' },
              { name: 'Customers', color: '#2563EB' },
              { name: 'Loans', color: '#7C3AED' },
              { name: 'Repayments', color: '#F59E0B' },
              { name: 'Payments', color: '#10B981' },
              { name: 'Audit Logs', color: '#64748B' },
            ].map(item => (
              <span key={item.name} style={{
                fontSize: 11,
                fontWeight: 600,
                color: item.color,
                background: 'var(--bg-card, #ffffff)',
                border: '1px solid rgba(0,0,0,0.08)',
                padding: '3px 8px',
                borderRadius: 6,
              }}>
                📋 {item.name}
              </span>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{
              width: '100%',
              background: '#059669',
              borderColor: '#047857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 700,
              padding: '11px',
              borderRadius: 10,
              boxShadow: '0 2px 10px rgba(5, 150, 105, 0.25)',
            }}
            onClick={handleDirectExcelExport}
            disabled={isGlobalExporting}
          >
            {isGlobalExporting ? (
              <>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Exporting Excel Workbook...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Extract &amp; Download Excel Sheet (.xlsx)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Danger Zone */}
      {['ADMIN', 'SUPER_ADMIN'].includes(user?.role) && (
        <div className="card" style={{
          padding: '18px',
          marginBottom: 20,
          border: '1px solid rgba(239,68,68,0.3)',
          background: 'rgba(239,68,68,0.03)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#DC2626', fontWeight: 800, fontSize: 15, marginBottom: 4 }}>
            <AlertOctagon size={18} /> Danger Zone
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.45 }}>
            Permanently deletes all customers, loans, repayments, and payments linked to your account.
          </div>
          <div style={{
            fontSize: 11.5,
            color: '#B45309',
            background: 'rgba(245,158,11,0.08)',
            borderRadius: 8,
            padding: '7px 10px',
            marginBottom: 14,
            border: '1px solid rgba(245,158,11,0.2)',
          }}>
            💡 Tip: You can download a complete Excel backup before deleting.
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{
              width: '100%',
              background: '#DC2626',
              borderColor: '#B91C1C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 700,
              padding: '11px',
              borderRadius: 10,
            }}
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 size={16} /> Delete All App Data
          </button>
        </div>
      )}

      {/* Sign out */}
      <button
        type="button"
        className="btn btn-primary"
        style={{
          width: '100%',
          background: 'var(--danger-500, #EF4444)',
          borderColor: 'var(--danger-600, #DC2626)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          fontSize: 13,
          fontWeight: 600,
          borderRadius: 10,
        }}
        onClick={logout}
      >
        <LogOut size={16} /> Sign Out
      </button>

      {/* Delete Confirmation & Extraction Modal */}
      {showDeleteModal && (
        <DeleteDataModal
          onClose={() => setShowDeleteModal(false)}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
