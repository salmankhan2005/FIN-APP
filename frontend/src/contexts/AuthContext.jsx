import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { initFirebaseForSuperAdmin } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser?.role === 'ADMIN') {
          initFirebaseForSuperAdmin(parsedUser);
        }
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
      setLoading(false);

      // Verify and sync user details in the background
      authAPI.me()
        .then(data => {
          if (data) {
            const updatedUser = data.user || data;
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            if (updatedUser?.role === 'ADMIN') {
              initFirebaseForSuperAdmin(updatedUser);
            }
          }
        })
        .catch((err) => {
          // ONLY clear session if server explicitly rejects token with HTTP 401
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
          }
        });
    } else {
      setLoading(false);
    }
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
      localStorage.setItem('token', response.accessToken);
    }
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      // Initialize Firebase Analytics ONLY for Super Admin
      if (response.user.role === 'ADMIN') {
        initFirebaseForSuperAdmin(response.user);
      }
    }
    return response.user;
  };

  const loginWithGoogle = async (googleUser) => {
    const response = await authAPI.googleLogin({
      email: googleUser.email,
      name: googleUser.displayName,
      role: 'ADMIN',
      uid: googleUser.uid
    });
    if (response.accessToken) {
      localStorage.setItem('token', response.accessToken);
    }
    if (response.refreshToken) {
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      // Initialize Firebase Analytics ONLY for Super Admin
      if (response.user.role === 'ADMIN') {
        initFirebaseForSuperAdmin(response.user);
      }
    }
    return response.user;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {}
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdmin = user?.role === 'ADMIN';
  const isAgent = user?.role === 'AGENT';
  const isCustomer = user?.role === 'CUSTOMER';

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout, isSuperAdmin, isAdmin, isAgent, isCustomer }}>
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
