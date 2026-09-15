import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogleForAdmin } from '../services/firebase';
import { User, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

const roleConfigs = {
  ADMIN: {
    title: 'Super Admin',
    emoji: '👑',
    color: '#3b82f6',
    badgeBg: 'rgba(59, 130, 246, 0.12)',
    badgeBorder: 'rgba(59, 130, 246, 0.3)',
    badgeColor: '#60a5fa',
    idLabel: 'Username or Email',
    idPlaceholder: 'admin@finova.com or phone',
    passPlaceholder: '••••••••',
    showGoogle: false,
  },
  AGENT: {
    title: 'Collection Agent',
    emoji: '🏍️',
    color: '#10b981',
    badgeBg: 'rgba(16, 185, 129, 0.12)',
    badgeBorder: 'rgba(16, 185, 129, 0.3)',
    badgeColor: '#34d399',
    idLabel: 'Agent Phone or Agent ID',
    idPlaceholder: '9659447695 or AGT-7625',
    passPlaceholder: 'Password or AGT-XXXX',
    showGoogle: false,
  },
  CUSTOMER: {
    title: 'Customer Portal',
    emoji: '📱',
    color: '#8b5cf6',
    badgeBg: 'rgba(139, 92, 246, 0.12)',
    badgeBorder: 'rgba(139, 92, 246, 0.3)',
    badgeColor: '#a78bfa',
    idLabel: 'Registered Mobile Number',
    idPlaceholder: '10-digit mobile number',
    passPlaceholder: 'Your PIN or password',
    showGoogle: false,
  },
};

export default function LoginPage({ onBackToHome, selectedRole = 'ADMIN', onLoginSuccess }) {
  const { login, loginWithGoogle, isRoleLoggedIn, getStoredRoleSession, switchOrRestoreRole } = useAuth();
  const [form, setForm] = useState({ userId: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const cfg = roleConfigs[selectedRole] || roleConfigs.ADMIN;
  const isSessionActive = isRoleLoggedIn ? isRoleLoggedIn(selectedRole) : false;
  const storedSession = getStoredRoleSession ? getStoredRoleSession(selectedRole) : null;
  const savedUser = storedSession?.user;

  const handleResumeSession = () => {
    if (switchOrRestoreRole && switchOrRestoreRole(selectedRole)) {
      if (onLoginSuccess) onLoginSuccess();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.userId, form.password, selectedRole);
      if (onLoginSuccess) onLoginSuccess();
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
      if (googleUser) {
        await loginWithGoogle(googleUser);
        if (onLoginSuccess) onLoginSuccess();
      }
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
      position: 'fixed',
      inset: 0,
      zIndex: 9980,
      background: 'var(--bg-primary, #0b132b)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
      overflow: 'hidden',
      height: '100dvh',
      width: '100vw',
    }}>
      {/* Mobile-first app frame */}
      <div style={{
        width: '100%',
        maxWidth: 440,
        height: '100%',
        background: 'var(--bg-card, #111c38)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 20px calc(env(safe-area-inset-bottom, 0px) + 16px)',
        boxSizing: 'border-box',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        borderLeft: '1px solid var(--border-subtle, rgba(255,255,255,0.06))',
        borderRight: '1px solid var(--border-subtle, rgba(255,255,255,0.06))',
      }}>
        {/* Top Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 40,
          marginBottom: 16,
        }}>
          {onBackToHome ? (
            <button
              onClick={onBackToHome}
              aria-label="Back"
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: 'var(--bg-surface, rgba(255,255,255,0.06))',
                border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
                color: 'var(--text-primary, #ffffff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <ArrowLeft size={18} />
            </button>
          ) : <div style={{ width: 36 }} />}

          {/* Role badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: cfg.badgeBg,
            border: `1px solid ${cfg.badgeBorder}`,
            color: cfg.badgeColor,
            borderRadius: 100,
            padding: '5px 12px',
            fontSize: 12,
            fontWeight: 700,
          }}>
            <span>{cfg.emoji}</span>
            <span>{cfg.title}</span>
          </div>
        </div>

        {/* Content Section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '8px 0' }}>
          {/* Logo & Title */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: `linear-gradient(135deg, ${cfg.color} 0%, #06b6d4 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              boxShadow: `0 6px 20px ${cfg.color}35`,
              overflow: 'hidden',
              border: '1.5px solid rgba(255,255,255,0.2)',
            }}>
              <img
                src="/logo-icon.png"
                alt="Finova"
                style={{
                  width: '80%',
                  height: '80%',
                  objectFit: 'contain',
                }}
                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML += '<span style="color:white;font-size:22px;font-weight:900">F</span>'; }}
              />
            </div>
            <h1 style={{
              fontSize: 'clamp(20px, 5.2vw, 24px)',
              fontWeight: 800,
              color: 'var(--text-primary, #ffffff)',
              margin: '0 0 4px 0',
              letterSpacing: '-0.3px',
            }}>
              Welcome Back
            </h1>
            <p style={{
              fontSize: 13,
              color: 'var(--text-muted, #94a3b8)',
              margin: 0,
            }}>
              Sign in to manage your {cfg.title.toLowerCase()} portal
            </p>
          </div>



          {/* Error message */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 12,
              padding: '10px 14px',
              marginBottom: 14,
              fontSize: 12.5,
              color: '#f87171',
              lineHeight: 1.4,
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
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted, #94a3b8)',
                  pointerEvents: 'none',
                }} />
                <input
                  type="text"
                  placeholder={cfg.idPlaceholder}
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck="false"
                  required
                  style={{
                    width: '100%',
                    height: 48,
                    paddingLeft: 42,
                    paddingRight: 14,
                    border: '1.5px solid var(--border-subtle, rgba(255,255,255,0.1))',
                    borderRadius: 14,
                    fontSize: 14,
                    color: 'var(--text-primary, #ffffff)',
                    outline: 'none',
                    background: 'var(--bg-surface, rgba(255,255,255,0.04))',
                    boxSizing: 'border-box',
                    transition: 'all 0.15s ease',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = cfg.color;
                    e.target.style.background = 'var(--bg-surface, rgba(255,255,255,0.07))';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--border-subtle, rgba(255,255,255,0.1))';
                    e.target.style.background = 'var(--bg-surface, rgba(255,255,255,0.04))';
                  }}
                />
              </div>
            </div>

            {/* Password input */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted, #94a3b8)',
                  pointerEvents: 'none',
                }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder={cfg.passPlaceholder}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                  required
                  style={{
                    width: '100%',
                    height: 48,
                    paddingLeft: 42,
                    paddingRight: 44,
                    border: '1.5px solid var(--border-subtle, rgba(255,255,255,0.1))',
                    borderRadius: 14,
                    fontSize: 14,
                    color: 'var(--text-primary, #ffffff)',
                    outline: 'none',
                    background: 'var(--bg-surface, rgba(255,255,255,0.04))',
                    boxSizing: 'border-box',
                    transition: 'all 0.15s ease',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = cfg.color;
                    e.target.style.background = 'var(--bg-surface, rgba(255,255,255,0.07))';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--border-subtle, rgba(255,255,255,0.1))';
                    e.target.style.background = 'var(--bg-surface, rgba(255,255,255,0.04))';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted, #94a3b8)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 4,
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: 48,
                background: loading ? 'rgba(59, 130, 246, 0.5)' : `linear-gradient(135deg, ${cfg.color} 0%, #2563eb 100%)`,
                color: '#ffffff',
                border: 'none',
                borderRadius: 14,
                fontSize: 14.5,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: `0 6px 20px ${cfg.color}40`,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {loading ? 'Authenticating...' : `Sign in as ${cfg.title}`}
            </button>
          </form>

          {/* Google Sign-In for Super Admin */}
          {cfg.showGoogle && (
            <div style={{ marginTop: 16 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 12,
              }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border-subtle, rgba(255,255,255,0.1))' }} />
                <span style={{ fontSize: 11.5, color: 'var(--text-muted, #94a3b8)', fontWeight: 500 }}>Or continue with</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-subtle, rgba(255,255,255,0.1))' }} />
              </div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                style={{
                  width: '100%',
                  height: 46,
                  background: 'var(--bg-surface, rgba(255,255,255,0.06))',
                  border: '1px solid var(--border-subtle, rgba(255,255,255,0.15))',
                  borderRadius: 14,
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: 'var(--text-primary, #ffffff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  cursor: (googleLoading || loading) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (!googleLoading && !loading) e.currentTarget.style.background = 'var(--bg-surface, rgba(255,255,255,0.1))';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--bg-surface, rgba(255,255,255,0.06))';
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>{googleLoading ? 'Connecting to Google...' : 'Sign in with Google'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Home Bar */}
        <div style={{
          width: 120,
          height: 4,
          background: 'var(--text-primary, #ffffff)',
          borderRadius: 2,
          opacity: 0.22,
          margin: '12px auto 0',
          flexShrink: 0,
        }} />
      </div>
    </div>
  );
}
