import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogleForAdmin } from '../services/firebase';
import { User, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function LoginPage({ onBackToHome, selectedRole = 'ADMIN' }) {
  const { login, loginWithGoogle } = useAuth();
  const [form, setForm] = useState({ userId: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const roleConfigs = {
    ADMIN: {
      title: 'Super Admin',
      idLabel: 'Username or Email',
      idPlaceholder: 'admin@finova.com or phone',
      passPlaceholder: '••••••••',
      demoUser: '6380372501',
      demoPass: 'Admin@123456',
      showGoogle: true,
    },
    AGENT: {
      title: 'Collection Agent',
      idLabel: 'Agent Phone or Agent ID',
      idPlaceholder: '9659447695 or AGT-7625',
      passPlaceholder: 'Password or AGT-XXXX',
      demoUser: '9659447695',
      demoPass: 'Admin@123456',
      showGoogle: false,
    },
    CUSTOMER: {
      title: 'Customer',
      idLabel: 'Registered Mobile Number',
      idPlaceholder: '10-digit mobile number',
      passPlaceholder: 'Your PIN or password',
      demoUser: '7418602826',
      demoPass: 'Admin@123456',
      showGoogle: false,
    },
  };

  const cfg = roleConfigs[selectedRole];

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
      background: '#f0f4f8',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px 20px',
      fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
      overflowY: 'auto',
    }}>
      {/* Back button */}
      {onBackToHome && (
        <button
          onClick={onBackToHome}
          style={{
            position: 'absolute', top: 52, left: 24,
            width: 38, height: 38, borderRadius: 12,
            background: 'white', border: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <ArrowLeft size={18} color="#475569" />
        </button>
      )}

      {/* Card */}
      <div style={{
        background: 'white', borderRadius: 28,
        padding: '36px 28px 32px',
        width: '100%', maxWidth: 400,
        boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
      }}>
        {/* Logo + Title */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1d4ed8 0%, #06b6d4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px auto',
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
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML += '<span style="color:white;font-size:24px;font-weight:900">F</span>'; }}
            />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
            FINOVA
          </h2>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
            Welcome Back
          </h3>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            Login as <strong style={{ color: '#1d4ed8' }}>{cfg.title}</strong>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 12, padding: '10px 14px', marginBottom: 16,
            fontSize: 13, color: '#dc2626', lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ position: 'relative' }}>
              <User size={17} style={{
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
                  width: '100%', height: 50,
                  paddingLeft: 42, paddingRight: 16,
                  border: '1.5px solid #e2e8f0', borderRadius: 14,
                  fontSize: 14, color: '#0f172a', outline: 'none',
                  background: '#f8fafc', boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ position: 'relative' }}>
              <Lock size={17} style={{
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
                  width: '100%', height: 50,
                  paddingLeft: 42, paddingRight: 46,
                  border: '1.5px solid #e2e8f0', borderRadius: 14,
                  fontSize: 14, color: '#0f172a', outline: 'none',
                  background: '#f8fafc', boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => { e.target.style.borderColor = '#2563eb'; e.target.style.background = 'white'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', color: '#94a3b8', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', padding: 4,
                }}
              >
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => setForm({ userId: cfg.demoUser, password: cfg.demoPass })}
              style={{
                background: 'none', border: 'none',
                color: '#2563eb', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', padding: 0,
              }}
            >
              Fill Demo Credentials
            </button>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', height: 50,
              background: loading ? '#93c5fd' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: 'white', border: 'none', borderRadius: 14,
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 20px rgba(37,99,235,0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        {/* Google Sign-In (Admin only) */}
        {cfg.showGoogle && (
          <div style={{ marginTop: 20 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
            }}>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Or continue with</span>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              style={{
                width: '100%', height: 50,
                background: 'white', border: '1.5px solid #e2e8f0',
                borderRadius: 14, fontSize: 14, fontWeight: 600,
                color: '#0f172a', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: 10,
                cursor: (googleLoading || loading) ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { if (!googleLoading && !loading) e.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>
          </div>
        )}

        {/* Already have an account note */}
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setForm({ userId: cfg.demoUser, password: cfg.demoPass })}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}
            >
              Login
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
