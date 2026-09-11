import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authAPI } from '../services/api';
import { initFirebaseForSuperAdmin, checkGoogleRedirectResult, listenToFirebaseAuth } from '../services/firebase';

const AuthContext = createContext(null);

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
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const authSyncInProgress = useRef(false);

  useEffect(() => {
    // 1. Listen for Firebase Auth state changes (triggers on redirect return and restored sessions)
    const unsubscribe = listenToFirebaseAuth(async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email && !authSyncInProgress.current) {
        const stored = sessionStorage.getItem('user') || localStorage.getItem('user');
        let currentEmail = null;
        try { currentEmail = stored ? JSON.parse(stored)?.email : null; } catch (_) {}

        if (currentEmail !== firebaseUser.email) {
          console.info('[Auth] Firebase detected Google user, authenticating with backend:', firebaseUser.email);
          authSyncInProgress.current = true;
          setIsAuthenticating(true);
          try {
            await loginWithGoogle(firebaseUser);
          } catch (err) {
            console.error('[Auth] Failed to sync Google login with backend:', err);
          } finally {
            setIsAuthenticating(false);
            authSyncInProgress.current = false;
          }
        }
      }
    });

    // 2. Also check direct redirect result explicitly
    checkGoogleRedirectResult()
      .then(async (googleUser) => {
        if (googleUser && !authSyncInProgress.current) {
          authSyncInProgress.current = true;
          setIsAuthenticating(true);
          try {
            await loginWithGoogle(googleUser);
          } catch (err) {
            console.warn('[Auth] Google redirect login error:', err);
          } finally {
            setIsAuthenticating(false);
            authSyncInProgress.current = false;
          }
        }
      })
      .catch((err) => {
        console.warn('[Auth] Google redirect check error:', err);
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
    // Clear local state immediately so UI responds instantly
    sessionStorage.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);

    // Fire backend logout in background (don't await — no need to block UI)
    const refreshToken = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
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
