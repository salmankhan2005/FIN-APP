import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogleForAdmin } from '../services/firebase';
import { Landmark, User, Lock, Eye, EyeOff, Phone, ArrowLeft, Shield, Bike, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage({ onBackToHome }) {
  const { login, loginWithGoogle } = useAuth();
  const [selectedRole, setSelectedRole] = useState('ADMIN'); // 'ADMIN' | 'AGENT' | 'CUSTOMER'
  const [form, setForm] = useState({ userId: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Role metadata configurations
  const roleConfigs = {
    ADMIN: {
      title: 'Super Admin',
      badge: 'Executive Portal',
      icon: '👑',
      tagline: 'Platform oversight, risk management, and profit analytics',
      themeColor: '#f59e0b',
      borderClass: 'role-tab-admin',
      idLabel: 'Admin Phone, Email, or Username',
      idPlaceholder: '6380372501 or admin@loanflow.com',
      passLabel: 'Admin Password',
      passPlaceholder: '••••••••',
      demoUser: '6380372501',
      demoPass: 'Admin@123456',
    },
    AGENT: {
      title: 'Field Agent',
      badge: 'Collection Hub',
      icon: '🏍️',
      tagline: 'GPS-mapped daily routes and on-the-spot collections',
      themeColor: '#3b82f6',
      borderClass: 'role-tab-agent',
      idLabel: 'Agent Phone Number or Agent ID',
      idPlaceholder: '9659447695 or AGT-7625',
      passLabel: 'Agent Password or Agent ID',
      passPlaceholder: 'Password or AGT-XXXX',
      demoUser: '9659447695',
      demoPass: 'Admin@123456',
    },
    CUSTOMER: {
      title: 'Customer',
      badge: 'Digital Passbook',
      icon: '📱',
      tagline: 'Track loan balances, upcoming installments, and receipts',
      themeColor: '#10b981',
      borderClass: 'role-tab-customer',
      idLabel: 'Registered Mobile Number',
      idPlaceholder: '10-digit mobile (e.g. 7418602826)',
      passLabel: 'Customer Password / PIN',
      passPlaceholder: '••••••••',
      demoUser: '7418602826',
      demoPass: 'Admin@123456',
    }
  };

  const currentConfig = roleConfigs[selectedRole];

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setError('');
    // Optionally clear or keep inputs
    setForm({ userId: '', password: '' });
  };

  const handleFillDemo = () => {
    setForm({
      userId: currentConfig.demoUser,
      password: currentConfig.demoPass
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.userId, form.password, selectedRole);
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify your role and try again.');
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
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // User closed the popup
        return;
      }
      if (
        err.code === 'auth/configuration-not-found' || 
        err.message?.includes('CONFIGURATION_NOT_FOUND') ||
        String(err).includes('CONFIGURATION_NOT_FOUND')
      ) {
        setError('Google Sign-In is not enabled yet in your Firebase Console. Please enable "Google" under Firebase Console → Authentication → Sign-in method, or sign in with your Super Admin password below.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized in Firebase. Add your domain to Firebase Console → Authentication → Settings → Authorized domains.');
      } else {
        setError(err.message || 'Google Sign-in failed. Please verify credentials or use your password.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card animate-in" style={{ maxWidth: '440px' }}>
        {onBackToHome && (
          <button 
            type="button" 
            onClick={onBackToHome}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-muted)', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: 6, 
              fontSize: 12, 
              fontWeight: 600, 
              cursor: 'pointer',
              marginBottom: 14,
              padding: 0
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </button>
        )}

        {/* Brand Header */}
        <div className="login-logo" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img 
            src="/logo-icon.png" 
            alt="Finova Logo" 
            style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '16px', 
              objectFit: 'contain', 
              margin: '0 auto 10px auto', 
              display: 'block',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)'
            }} 
          />
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>Finova</h2>
          <p style={{ color: 'var(--accent-500)', fontSize: '12px', fontWeight: '600', margin: '3px 0 0 0', letterSpacing: '0.3px' }}>
            Smart Money. Better Future.
          </p>
        </div>

        {/* ─── Role / Category Selector ────────────────────────────────────── */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '11px', 
            fontWeight: '700', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px', 
            color: 'var(--text-muted)', 
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            Select Login Category
          </label>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr', 
            gap: '6px',
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '4px',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            {Object.entries(roleConfigs).map(([key, cfg]) => {
              const isActive = selectedRole === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleRoleSelect(key)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 4px',
                    borderRadius: '10px',
                    border: isActive ? `1px solid ${cfg.themeColor}` : '1px solid transparent',
                    background: isActive ? `${cfg.themeColor}22` : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '18px', marginBottom: '2px' }}>{cfg.icon}</span>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: '800', 
                    color: isActive ? cfg.themeColor : 'var(--text-muted)',
                    letterSpacing: '-0.2px'
                  }}>
                    {cfg.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Role Info Tagline */}
          <div style={{ 
            marginTop: '8px', 
            padding: '6px 10px', 
            borderRadius: '8px', 
            background: `${currentConfig.themeColor}12`,
            border: `1px solid ${currentConfig.themeColor}33`,
            fontSize: '11px',
            color: 'var(--text-secondary)',
            textAlign: 'center'
          }}>
            <span style={{ fontWeight: '700', color: currentConfig.themeColor }}>
              {currentConfig.badge}:
            </span>{' '}
            {currentConfig.tagline}
          </div>
        </div>

        {error && <div className="login-error">{error}</div>}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{currentConfig.idLabel}</label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="form-input input-with-icon-left"
                type="text"
                placeholder={currentConfig.idPlaceholder}
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{currentConfig.passLabel}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="form-input input-with-icon-both"
                type={showPass ? 'text' : 'password'}
                placeholder={currentConfig.passPlaceholder}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="current-password"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Quick Demo Fill Helper */}
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleFillDemo}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: currentConfig.themeColor,
                fontSize: '11px',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Sparkles size={12} />
              <span>Fill Demo {currentConfig.title}</span>
            </button>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary login-submit" 
            disabled={loading}
            style={{
              background: `linear-gradient(135deg, ${currentConfig.themeColor} 0%, #059669 100%)`,
              border: 'none',
              boxShadow: `0 4px 16px ${currentConfig.themeColor}44`
            }}
          >
            {loading ? 'Authenticating...' : `Sign In as ${currentConfig.title}`}
          </button>
        </form>

        {/* Sign in with Google - Displayed exclusively for Super Admin */}
        {selectedRole === 'ADMIN' && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              margin: '0 0 16px 0' 
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                or continue with
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              style={{
                width: '100%',
                height: '46px',
                background: '#ffffff',
                color: '#1f2937',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
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
    </div>
  );
}
