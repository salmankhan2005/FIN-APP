import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogleForAdmin } from '../services/firebase';
import { User, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const roleConfigs = {
  ADMIN: {
    title: 'Super Admin',
    emoji: '👑',
    color: '#2563eb',
    badgeBg: '#eff6ff',
    badgeBorder: '#bfdbfe',
    badgeColor: '#1d4ed8',
    idLabel: 'Username or Email',
    idPlaceholder: 'admin@finova.com or phone',
    passPlaceholder: '••••••••',
    demoUser: '6380372501',
    demoPass: 'Admin@123456',
    showGoogle: true,
  },
  AGENT: {
    title: 'Collection Agent',
    emoji: '🏍️',
    color: '#059669',
    badgeBg: '#f0fdf4',
    badgeBorder: '#a7f3d0',
    badgeColor: '#047857',
    idLabel: 'Agent Phone or Agent ID',
    idPlaceholder: '9659447695 or AGT-7625',
    passPlaceholder: 'Password or AGT-XXXX',
    demoUser: '9659447695',
    demoPass: 'Admin@123456',
    showGoogle: false,
  },
  CUSTOMER: {
    title: 'Customer',
    emoji: '📱',
    color: '#2563eb',
    badgeBg: '#eff6ff',
    badgeBorder: '#bfdbfe',
    badgeColor: '#1d4ed8',
    idLabel: 'Registered Mobile Number',
    idPlaceholder: '10-digit mobile number',
    passPlaceholder: 'Your PIN or password',
    demoUser: '7418602826',
    demoPass: 'Admin@123456',
    showGoogle: false,
  },
};

export default function LoginPage({ onBackToHome, selectedRole = 'ADMIN' }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ userId: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const cfg = roleConfigs[selectedRole] || roleConfigs.ADMIN;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.userId, form.password, selectedRole);
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const googleUser = await signInWithGoogleForAdmin();
      if (googleUser) await loginWithGoogle(googleUser);
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return;
      if (err.code === 'auth/configuration-not-found' || err.message?.includes('CONFIGURATION_NOT_FOUND')) {
        setError('Google Sign-In is not enabled in Firebase Console yet. Use your password below.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized in Firebase. Add it under Firebase → Authentication → Settings → Authorized domains.');
      } else {
        setError(err.message || 'Google Sign-In failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9980,
      background: '#f8fafc',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
      overflow: 'hidden', height: '100dvh', width: '100vw',
    }}>
      {/* Mobile-constrained container */}
      <div style={{
        width: '100%', maxWidth: 430, height: '100%',
        background: '#ffffff',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'clamp(14px, 2.5vh, 22px) 24px 18px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        boxShadow: '0 0 50px rgba(0,0,0,0.06)',
      }}>
        {/* Top Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          minHeight: 40, marginBottom: 'clamp(10px, 2vh, 18px)',
        }}>
          {onBackToHome ? (
            <button
              onClick={onBackToHome}
              aria-label="Back"
              style={{
                width: 36, height: 36, borderRadius: 12,
                background: '#f8fafc', border: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; }}
            >
              <ArrowLeft size={17} color="#475569" />
            </button>
          ) : <div style={{ width: 36 }} />}

          {/* Role badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: cfg.badgeBg, border: `1px solid ${cfg.badgeBorder}`,
            color: cfg.badgeColor, borderRadius: 20,
            padding: '5px 12px', fontSize: 12, fontWeight: 700,
          }}>
            <span>{cfg.emoji}</span>
            <span>{cfg.title}</span>
          </div>
        </div>

        {/* Content Section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Logo & Title */}
          <div style={{ textAlign: 'center', marginBottom: 'clamp(14px, 2.5vh, 22px)' }}>
            <div style={{
              width: 58, height: 58, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1d4ed8 0%, #06b6d4 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 10px auto',
              boxShadow: '0 6px 20px rgba(29,78,216,0.3)',
              overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.3)',
            }}>
              <img
                src="/logo-icon.png"
                alt="Finova"
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  transform: 'scale(1.18)',
                  borderRadius: '50%',
                }}
                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML += '<span style="color:white;font-size:22px;font-weight:900">F</span>'; }}
              />
            </div>
            <h1 style={{
              fontSize: 'clamp(20px, 5vw, 23px)', fontWeight: 800, color: '#0f172a',
              margin: '0 0 4px 0', letterSpacing: '-0.3px',
            }}>
              Welcome Back
            </h1>
            <p style={{ fontSize: 'clamp(12px, 3.2vw, 13px)', color: '#64748b', margin: 0 }}>
              Sign in to manage your {cfg.title.toLowerCase()} portal
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: 12, padding: '9px 12px', marginBottom: 14,
              fontSize: 12.5, color: '#dc2626', lineHeight: 1.4,
            }}>
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Identifier input */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', color: '#94a3b8',
                }} />
                <input
                  type="text"
                  placeholder={cfg.idPlaceholder}
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  autoComplete="username"
                  required
                  style={{
                    width: '100%', height: 48,
                    paddingLeft: 40, paddingRight: 14,
                    border: '1.5px solid #e2e8f0', borderRadius: 14,
                    fontSize: 13.5, color: '#0f172a', outline: 'none',
                    background: '#f8fafc', boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = cfg.color; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                />
              </div>
            </div>

            {/* Password input */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', color: '#94a3b8',
                }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder={cfg.passPlaceholder}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                  required
                  style={{
                    width: '100%', height: 48,
                    paddingLeft: 40, paddingRight: 44,
                    border: '1.5px solid #e2e8f0', borderRadius: 14,
                    fontSize: 13.5, color: '#0f172a', outline: 'none',
                    background: '#f8fafc', boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = cfg.color; e.target.style.background = 'white'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: 10, top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', color: '#94a3b8', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', padding: 4,
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Quick Demo Fill */}
            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => setForm({ userId: cfg.demoUser, password: cfg.demoPass })}
                style={{
                  background: 'none', border: 'none',
                  color: cfg.color, fontSize: 11.5, fontWeight: 600,
                  cursor: 'pointer', padding: 0,
                }}
              >
                Auto-fill demo credentials
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: 48,
                background: loading ? '#93c5fd' : cfg.color,
                color: 'white', border: 'none', borderRadius: 24,
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: `0 6px 20px ${cfg.color}35`,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.92'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              {loading ? 'Signing in...' : `Login as ${cfg.title}`}
            </button>
          </form>

          {/* Google Sign-In for Super Admin */}
          {cfg.showGoogle && (
            <div style={{ marginTop: 14 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
              }}>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                <span style={{ fontSize: 11.5, color: '#94a3b8', fontWeight: 500 }}>Or continue with</span>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              </div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                style={{
                  width: '100%', height: 46,
                  background: 'white', border: '1.5px solid #e2e8f0',
                  borderRadius: 23, fontSize: 13.5, fontWeight: 600,
                  color: '#0f172a', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: 10,
                  cursor: (googleLoading || loading) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { if (!googleLoading && !loading) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>{googleLoading ? 'Redirecting to Google...' : 'Continue with Google'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Home indicator */}
        <div style={{
          width: 120, height: 4, background: '#0f172a',
          borderRadius: 2, opacity: 0.18,
          margin: '12px auto 0', flexShrink: 0,
        }} />
      </div>
    </div>
  );
}
