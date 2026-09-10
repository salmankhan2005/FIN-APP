import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Bell, Send, AlertTriangle, Settings, RefreshCw, CheckCircle, KeyRound, ShieldAlert, Check, Eye, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function NotificationsDashboard() {
  const { isCustomer } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [settings, setSettings] = useState(null);
  const [history, setHistory] = useState([]);
  const [inAppAlerts, setInAppAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      notificationsAPI.getDashboard(),
      notificationsAPI.getSettings(),
      notificationsAPI.getHistory(20),
      notificationsAPI.getInApp()
    ]).then(([dashRes, setRes, histRes, inAppRes]) => {
      setDashboard(dashRes);
      setSettings(setRes);
      setHistory(histRes);
      setInAppAlerts(inAppRes || []);
    }).catch(err => {
      toast.error('Failed to load notifications data');
    }).finally(() => setLoading(false));
  };

  const handleMarkAlertRead = (id) => {
    notificationsAPI.markRead(id).then(() => {
      setInAppAlerts(prev => prev.filter(a => a.id !== id));
      toast.success('Alert marked as reviewed');
    }).catch(() => {
      toast.error('Failed to update alert');
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSettingChange = (field, value) => {
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    
    // Convert array back to numbers if needed, but in this UI we'll just handle enabled for now
    notificationsAPI.updateSettings({
      enabled: updated.enabled,
      daysBeforeDue: typeof updated.daysBeforeDue === 'string' ? JSON.parse(updated.daysBeforeDue) : updated.daysBeforeDue
    }).then(() => toast.success('Settings updated'))
      .catch(() => toast.error('Failed to update settings'));
  };

  const handleTrigger = () => {
    setTriggering(true);
    notificationsAPI.triggerCron()
      .then(() => {
        toast.success('Manual trigger started. Refreshing in a moment...');
        setTimeout(loadData, 2000);
      })
      .catch(() => toast.error('Trigger failed'))
      .finally(() => setTriggering(false));
  };

  if (loading && !dashboard) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="animate-in pb-20">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Notification Center</div>
        <button onClick={handleTrigger} disabled={triggering} className="btn btn-primary btn-sm">
          <RefreshCw size={14} className={triggering ? 'spin' : ''} />
          Force Send Now
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-title">Due Today</div>
          <div className="stat-value">{dashboard?.dueToday || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Upcoming (7 days)</div>
          <div className="stat-value">{dashboard?.upcoming || 0}</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'var(--danger-500)', backgroundColor: 'var(--danger-50)' }}>
          <div className="stat-title" style={{ color: 'var(--danger-600)' }}>Overdue</div>
          <div className="stat-value text-danger">{dashboard?.overdue || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Sent Total</div>
          <div className="stat-value" style={{ color: 'var(--success-600)' }}>{dashboard?.sent || 0}</div>
        </div>
      </div>

      {/* Agent Credential Activity - Indicated to Super Admin (hidden for customers) */}
      {!isCustomer && (
      <div className="card mb-24" style={{
        border: '1px solid rgba(16, 185, 129, 0.35)',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)',
        padding: 20,
        borderRadius: 16,
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <KeyRound size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Agent Credential & Field Alerts</span>
                <span className="badge badge-success" style={{ fontSize: 10, padding: '2px 8px' }}>
                  {inAppAlerts.filter(a => a.isAgentAlert).length} Active Indications
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Field Agent credential creations automatically indicated to Super Admin with audit verification
              </div>
            </div>
          </div>
        </div>

        {inAppAlerts.filter(a => a.isAgentAlert).length === 0 ? (
          <div style={{
            padding: '16px 20px',
            textAlign: 'center',
            background: 'var(--bg-secondary)',
            borderRadius: 12,
            color: 'var(--text-muted)',
            fontSize: 13
          }}>
            No pending agent credential alerts. All field credential actions are up to date.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {inAppAlerts.filter(a => a.isAgentAlert).map(alert => (
              <div
                key={alert.id}
                style={{
                  background: 'var(--card-bg, #ffffff)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 12,
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2
                  }}>
                    <UserCheck size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span>Agent: <strong style={{ color: 'var(--primary-500)' }}>{alert.agentName || 'Field Agent'}</strong></span>
                      <span className="badge badge-warning" style={{ fontSize: 10 }}>
                        Customer Credential Created
                      </span>
                      <span className="badge badge-outline" style={{ fontSize: 10, borderColor: '#10b981', color: '#10b981' }}>
                        🛡️ Indicated to Admin
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 4 }}>
                      Customer: <strong>{alert.customerName || 'N/A'}</strong> (Phone: <span style={{ fontFamily: 'monospace' }}>{alert.customerPhone || 'N/A'}</span>)
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      Created: {new Date(alert.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {alert.customerId && (
                    <Link
                      to={`/customers/${alert.customerId}`}
                      className="btn btn-outline btn-xs"
                      style={{ gap: 4 }}
                    >
                      <Eye size={12} /> View Customer
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => handleMarkAlertRead(alert.id)}
                    className="btn btn-ghost btn-xs"
                    style={{ gap: 4, color: 'var(--text-muted)' }}
                  >
                    <Check size={12} /> Acknowledge
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Settings */}
      <div className="card" style={{ padding: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 700 }}>
          <Settings size={18} /> Global Reminder Settings
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Enable Automated Reminders</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sends WhatsApp/App notifications automatically at 8:00 AM</div>
          </div>
          <label className="switch">
            <input type="checkbox" checked={settings?.enabled || false} onChange={e => handleSettingChange('enabled', e.target.checked)} />
            <span className="slider round"></span>
          </label>
        </div>

        <div style={{ padding: '12px 0' }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>When to Send Reminders</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
            Select the days on which customers should receive a payment reminder. Toggle each option on or off.
          </div>

          {/* Chip Toggle Selector */}
          {(() => {
            const raw = settings?.daysBeforeDue;
            const selected = Array.isArray(raw) ? raw : (typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch { return []; } })() : []);

            const presets = [
              { label: '3 Days Before', value: 3, emoji: '📅' },
              { label: '2 Days Before', value: 2, emoji: '📆' },
              { label: '1 Day Before',  value: 1, emoji: '⏰' },
              { label: 'Due Day',       value: 0, emoji: '🔔' },
              { label: '1 Day Overdue', value: -1, emoji: '⚠️' },
              { label: '2 Days Overdue',value: -2, emoji: '🚨' },
            ];

            const toggle = (val) => {
              const next = selected.includes(val)
                ? selected.filter(v => v !== val)
                : [...selected, val].sort((a, b) => b - a);
              setSettings({ ...settings, daysBeforeDue: next });
              handleSettingChange('daysBeforeDue', next);
            };

            return (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {presets.map(p => {
                  const active = selected.includes(p.value);
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => toggle(p.value)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
                        fontWeight: 600, fontSize: 13, transition: 'all 0.18s',
                        border: active ? '2px solid var(--primary-500)' : '2px solid var(--border-color)',
                        background: active ? 'rgba(99,102,241,0.12)' : 'var(--bg-secondary)',
                        color: active ? 'var(--primary-500)' : 'var(--text-muted)',
                        boxShadow: active ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
                      }}
                    >
                      <span>{p.emoji}</span>
                      <span>{p.label}</span>
                      {active && <span style={{ fontSize: 10, background: 'var(--primary-500)', color: '#fff', borderRadius: 50, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            );
          })()}

          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-secondary)', fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📋</span>
            <span>
              <strong>Active schedule: </strong>
              {(() => {
                const raw = settings?.daysBeforeDue;
                const arr = Array.isArray(raw) ? raw : (typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch { return []; } })() : []);
                if (!arr.length) return 'No days selected — reminders are disabled.';
                const labels = { 3:'3 Days Before', 2:'2 Days Before', 1:'1 Day Before', 0:'Due Day', '-1':'1 Day Overdue', '-2':'2 Days Overdue' };
                return arr.sort((a, b) => b - a).map(v => labels[v] || `${Math.abs(v)} day${Math.abs(v)>1?'s':''} ${v<0?'overdue':'before'}`).join(', ');
              })()}
            </span>
          </div>
        </div>
      </div>

      {/* History */}
      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 12 }}>Recent Notifications</div>
      <div className="card" style={{ overflow: 'hidden' }}>
        {history.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No notifications sent yet.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map(log => (
                <tr key={log.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{log.customer?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.repayment?.loan?.loanNumber}</div>
                  </td>
                  <td><span className="badge">{log.type}</span></td>
                  <td>
                    {log.status === 'SENT' ? <span className="badge badge-success">SENT</span> : <span className="badge badge-danger">FAILED</span>}
                  </td>
                  <td style={{ fontSize: 12 }}>{new Date(log.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
