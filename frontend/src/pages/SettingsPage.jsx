import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, AlertOctagon, Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { dashboardAPI, usersAPI } from '../services/api';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  
  const handleReset = async () => {
    if (window.confirm("Are you ABSOLUTELY sure you want to delete ALL customer and loan data? This cannot be undone!")) {
      if (window.confirm("FINAL WARNING: All loans, repayments, and customers will be permanently deleted. Only users will remain. Proceed?")) {
        try {
          const res = await dashboardAPI.resetAllData();
          toast.success(res.message || "Database has been reset successfully.");
          setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
          toast.error(err.message || 'Reset failed');
        }
      }
    }
  };

  const handleSave = async () => {
    try {
      await usersAPI.update(user.id, formData);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    }
  };

  return (
    <div className="animate-in" style={{ maxWidth: 500, margin: '0 auto', paddingBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Profile & Settings</div>
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
      
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px 20px', marginBottom: 16 }}>
        <div className="sidebar-avatar" style={{ width: 80, height: 80, fontSize: 32, fontWeight: 700, marginBottom: 16 }}>
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
        
        {isEditing ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left', marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Name</label>
              <input 
                type="text" 
                className="input" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Email</label>
              <input 
                type="email" 
                className="input" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Phone</label>
              <input 
                type="text" 
                className="input" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
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
              <span className="badge badge-info" style={{ fontSize: 11, padding: '4px 10px' }}>
                Role: {user?.role}
              </span>
              <span className="badge badge-success" style={{ fontSize: 11, padding: '4px 10px' }}>
                Status: Active
              </span>
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

      <button
        className="btn btn-primary"
        style={{ width: '100%', background: 'var(--danger-500)', borderColor: 'var(--danger-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 30 }}
        onClick={logout}
      >
        <LogOut size={16} /> Sign Out
      </button>

      {/* DANGER ZONE */}
      {['ADMIN', 'SUPER_ADMIN'].includes(user?.role) && (
        <div className="card" style={{ padding: '24px', border: '1px solid var(--danger-500)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger-600)', fontWeight: 800, fontSize: 16, marginBottom: 10 }}>
            <AlertOctagon size={20} />
            Danger Zone
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            This will permanently delete ALL customers, loans, and collections. Only User accounts will remain.
          </div>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', background: 'var(--danger-600)', borderColor: 'var(--danger-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            onClick={handleReset}
          >
            <AlertOctagon size={16} /> Delete All App Data
          </button>
        </div>
      )}
    </div>
  );
}
