import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authAPI } from '../services/api';
import { initFirebaseForSuperAdmin, checkGoogleRedirectResult, listenToFirebaseAuth, signOutFromFirebase } from '../services/firebase';

const AuthContext = createContext(null);

// Detect if we are returning from a Google redirect
function isReturningFromGoogleRedirect() {
  try {
    const keys = Object.keys(localStorage);
    return keys.some(k => k.includes('pendingRedirect') || k.includes('firebase:pendingRedirect'));
  } catch (_) {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.role === 'ADMIN') {
          initFirebaseForSuperAdmin(parsedUser);
        }
        return parsedUser;
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        return null;
      }
    }
    return null;
  });
  
  const [loading, setLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(() => {
    const hasStoredUser = !!(sessionStorage.getItem('user') || localStorage.getItem('user'));
    if (hasStoredUser) return false;
    if (localStorage.getItem('finova_auth_pending') === 'true') return true;
    return isReturningFromGoogleRedirect();
  });
  const authSyncInProgress = useRef(false);

  useEffect(() => {
    let redirectCheckDone = false;

    // 1. Check direct redirect result first (most reliable after signInWithRedirect)
    checkGoogleRedirectResult()
      .then(async (googleUser) => {
        redirectCheckDone = true;
        if (googleUser && !authSyncInProgress.current) {
          console.info('[Auth] Got redirect result for:', googleUser.email);
          authSyncInProgress.current = true;
          setIsAuthenticating(true);
          try {
            await loginWithGoogle(googleUser);
          } catch (err) {
            console.warn('[Auth] Google redirect login error:', err);
            setIsAuthenticating(false);
          } finally {
            localStorage.removeItem('finova_auth_pending');
            authSyncInProgress.current = false;
          }
        } else {
          localStorage.removeItem('finova_auth_pending');
          setIsAuthenticating(false);
        }
      })
      .catch((err) => {
        redirectCheckDone = true;
        console.warn('[Auth] Google redirect check error:', err);
        localStorage.removeItem('finova_auth_pending');
        setIsAuthenticating(false);
      });

    // 2. Listen for Firebase Auth state changes
    const unsubscribe = listenToFirebaseAuth(async (firebaseUser) => {
      // Do not auto-relogin if user explicitly logged out and no auth is pending
      const isAuthPending = localStorage.getItem('finova_auth_pending') === 'true';
      if (localStorage.getItem('finova_logged_out') === 'true' && !isAuthPending) {
        setIsAuthenticating(false);
        return;
      }

      if (firebaseUser && firebaseUser.email && !authSyncInProgress.current) {
        const stored = sessionStorage.getItem('user') || localStorage.getItem('user');
        let currentEmail = null;
        try { currentEmail = stored ? JSON.parse(stored)?.email : null; } catch (_) {}

        // Only sync if user was already logged in or an auth attempt is pending
        if (currentEmail !== firebaseUser.email && (stored || isAuthPending || isReturningFromGoogleRedirect())) {
          console.info('[Auth] Firebase state: Google user detected, syncing with backend:', firebaseUser.email);
          authSyncInProgress.current = true;
          setIsAuthenticating(true);
          try {
            await loginWithGoogle(firebaseUser);
          } catch (err) {
            console.error('[Auth] Failed to sync Google login with backend:', err);
            setIsAuthenticating(false);
          } finally {
            localStorage.removeItem('finova_auth_pending');
            authSyncInProgress.current = false;
          }
        } else {
          setIsAuthenticating(false);
        }
      } else if (!firebaseUser) {
        if (redirectCheckDone) setIsAuthenticating(false);
      }
    });

    const token = sessionStorage.getItem('token') || localStorage.getItem('token');

    if (token && user) {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5000)
      );

      Promise.race([authAPI.me(), timeout])
        .then(data => {
          if (data) {
            const updatedUser = data.user || data;
            setUser(updatedUser);
            const userStr = JSON.stringify(updatedUser);
            sessionStorage.setItem('user', userStr);
            localStorage.setItem('user', userStr);
            if (updatedUser?.role === 'ADMIN') {
              initFirebaseForSuperAdmin(updatedUser);
            }
          }
        })
        .catch((err) => {
          if (err?.message === 'timeout' || !err?.response) return;
          if (err.response?.status === 401) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
          }
        });
    }

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const login = async (phone, agentId, role) => {
    const response = await authAPI.login({
      phone,
      email: phone,
      userId: phone,
      username: phone,
      agentId,
      password: agentId,
      role
    });
    if (response.accessToken) {
      sessionStorage.setItem('token', response.accessToken);
      localStorage.setItem('token', response.accessToken);
    }
    if (response.refreshToken) {
      sessionStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    if (response.user) {
      const userStr = JSON.stringify(response.user);
      sessionStorage.setItem('user', userStr);
      localStorage.setItem('user', userStr);
      sessionStorage.setItem('finova_onboarding_done', 'true');
      localStorage.setItem('finova_onboarding_done', 'true');
      setUser(response.user);
      if (response.user.role === 'ADMIN') {
        initFirebaseForSuperAdmin(response.user);
      }
    }
    return response.user;
  };

  const loginWithGoogle = async (googleUser) => {
    try {
      localStorage.removeItem('finova_logged_out');
      sessionStorage.removeItem('finova_logged_out');
      setIsAuthenticating(true);
      const response = await authAPI.googleLogin({
        email: googleUser.email,
        name: googleUser.displayName,
        role: 'ADMIN',
        uid: googleUser.uid,
        isGoogle: true
      });

      if (response?.accessToken) {
        sessionStorage.setItem('token', response.accessToken);
        localStorage.setItem('token', response.accessToken);
      }
      if (response?.refreshToken) {
        sessionStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      if (response?.user) {
        const userObj = {
          ...response.user,
          email: googleUser.email || response.user.email,
          name: googleUser.displayName || response.user.name,
        };
        const userStr = JSON.stringify(userObj);
        sessionStorage.setItem('user', userStr);
        localStorage.setItem('user', userStr);
        sessionStorage.setItem('finova_onboarding_done', 'true');
        localStorage.setItem('finova_onboarding_done', 'true');
        setUser(userObj);
        if (userObj.role === 'ADMIN') {
          initFirebaseForSuperAdmin(userObj);
        }
        return userObj;
      }
    } catch (err) {
      console.error('[Auth] Google login error:', err);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    // 1. Explicitly flag that user logged out so onAuthStateChanged doesn't auto-relogin
    localStorage.setItem('finova_logged_out', 'true');
    sessionStorage.setItem('finova_logged_out', 'true');

    // 2. Clear Firebase Auth session completely so next Google sign-in prompts account chooser
    try {
      await signOutFromFirebase();
    } catch (_) {}

    // 3. Clear local state immediately so UI responds instantly
    const refreshToken = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
    sessionStorage.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.setItem('finova_logged_out', 'true');
    setUser(null);

    // Notify all components/caches to purge their admin-specific state
    try { window.dispatchEvent(new Event('finova:auth:logout')); } catch (_) {}

    // 4. Fire backend logout in background
    if (refreshToken) {
      authAPI.logout().catch(() => {}); // fire-and-forget
    }
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdmin = user?.role === 'ADMIN';
  const isAgent = user?.role === 'AGENT';
  const isCustomer = user?.role === 'CUSTOMER';

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticating, login, loginWithGoogle, logout, isSuperAdmin, isAdmin, isAgent, isCustomer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
