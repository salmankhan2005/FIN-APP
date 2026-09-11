import axios from 'axios';

const PROD_API_URL = 'https://finance-app-841v.onrender.com/api';
const DEV_API_URL = 'http://localhost:5000/api';

const isProduction = typeof window !== 'undefined' && 
  window.location.hostname !== 'localhost' && 
  window.location.hostname !== '127.0.0.1';

const envApiUrl = import.meta.env && import.meta.env.VITE_API_URL;
const validEnvUrl = envApiUrl && (!isProduction || !envApiUrl.includes('localhost')) ? envApiUrl : null;

// Clean & sanitize stored API URL
const getCleanApiUrl = () => {
  if (typeof window === 'undefined') return isProduction ? PROD_API_URL : DEV_API_URL;
  
  let stored = localStorage.getItem('finova_api_url');
  if (stored) {
    // Sanitize any malformed prefixes like /= or leading slashes/spaces or legacy URLs
    stored = stored.trim().replace(/^[/=\s]+/, '');
    if (!stored.startsWith('http://') && !stored.startsWith('https://')) {
      stored = 'https://' + stored;
    }
    if (stored.includes('841v') || (isProduction && (stored.includes('localhost') || stored.includes('127.0.0.1')))) {
      localStorage.removeItem('finova_api_url');
      stored = null;
    }
  }

  let finalUrl = stored || (validEnvUrl && (validEnvUrl.startsWith('http://') || validEnvUrl.startsWith('https://')) ? validEnvUrl : (isProduction ? PROD_API_URL : DEV_API_URL));

  // Ensure finalUrl always ends with /api (without trailing slashes before it)
  finalUrl = finalUrl.replace(/\/+$/, '');
  if (!finalUrl.endsWith('/api')) {
    finalUrl = `${finalUrl}/api`;
  }

  return finalUrl;
};

const API_URL = getCleanApiUrl();

const api = axios.create({
  baseURL: API_URL,
});

// Helper to retrieve auth tokens isolated by session/tab
export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('token') || localStorage.getItem('token');
};

export const getAuthRefreshToken = () => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
};

// Interceptor to add JWT token and tunnel bypass header
api.interceptors.request.use((config) => {
  config.headers['Bypass-Tunnel-Reminder'] = 'true'; // Bypass localtunnel splash screen
  
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor to handle 401s silently using the refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet, and it's not the refresh or login endpoint itself
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh') && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      const refreshToken = getAuthRefreshToken();
      
      if (refreshToken) {
        try {
          // Send request directly via axios to avoid interceptor loop
          const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          
          if (res.data?.success && res.data?.data?.accessToken) {
            const newAccess = res.data.data.accessToken;
            sessionStorage.setItem('token', newAccess);
            localStorage.setItem('token', newAccess);
            if (res.data.data.refreshToken) {
              sessionStorage.setItem('refreshToken', res.data.data.refreshToken);
              localStorage.setItem('refreshToken', res.data.data.refreshToken);
            }
            
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Only clear session if server explicitly rejects refresh with HTTP 401/403
          if (refreshError.response && (refreshError.response.status === 401 || refreshError.response.status === 403)) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
          // Note: DO NOT call window.location.reload()! React state handles session transitions cleanly.
        }
      }
    }
    // Map backend error message directly to error.message so toasts show actual API errors
    if (error.response?.data?.message) {
      error.message = error.response.data.message;
    }
    
    return Promise.reject(error);
  }
);

// Generic response data extractor
const extractData = (res) => {
  if (res.data && res.data.success && res.data.data !== undefined) {
    return res.data.data;
  }
  return res.data;
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data).then(extractData),
  googleLogin: (data) => api.post('/auth/google-login', {
    email: data.email,
    name: data.name || data.displayName,
    uid: data.uid,
    isGoogle: true,
    role: 'ADMIN'
  }).catch((err) => {
    // If /auth/google-login returned 404 on an older backend deployment, fallback to /auth/login
    return api.post('/auth/login', {
      email: data.email,
      name: data.name || data.displayName,
      uid: data.uid,
      isGoogle: true,
      role: 'ADMIN'
    });
  }).then(extractData),
  me: () => api.get('/auth/me').then(extractData),
  logout: () => {
    const refreshToken = getAuthRefreshToken();
    const promise = refreshToken ? api.post('/auth/logout', { refreshToken }) : Promise.resolve();
    
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    return promise;
  },
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersAPI = {
  list: (params) => api.get('/users', { params }).then(extractData),
  create: (data) => api.post('/users', data).then(extractData),
  update: (id, data) => api.patch(`/users/${id}`, data).then(extractData),
  changePassword: (id, data) => api.patch(`/users/${id}/password`, data).then(extractData),
  delete: (id) => api.delete(`/users/${id}`).then(extractData),
};

// ─── Customers ────────────────────────────────────────────────────────────────
export const customersAPI = {
  list: (params) => api.get('/customers', { params }).then(extractData),
  get: (id) => api.get(`/customers/${id}`).then(extractData),
  create: (data) => api.post('/customers', data).then(extractData),
  update: (id, data) => api.put(`/customers/${id}`, data).then(extractData),
  delete: (id) => api.delete(`/customers/${id}`).then(extractData),
  setCredentials: (id, data) => api.post(`/customers/${id}/credentials`, data).then(extractData),
};

// ─── Loans ────────────────────────────────────────────────────────────────────
export const loansAPI = {
  list: (params) => api.get('/loans', { params }).then(extractData),
  get: (id) => api.get(`/loans/${id}`).then(extractData),
  create: (data) => api.post('/loans', data).then(extractData),
  updateStatus: (id, data) => api.patch(`/loans/${id}/status`, data).then(extractData),
  delete: (id) => api.delete(`/loans/${id}`).then(extractData),
  getPreclosure: (id) => api.get(`/loans/${id}/preclosure`).then(extractData),
  downloadReport: () => Promise.resolve({ data: 'Report available via backend only' }),
};

// ─── Repayments ───────────────────────────────────────────────────────────────
export const repaymentsAPI = {
  list: (params) => api.get('/repayments', { params }).then(extractData),
  today: () => api.get('/repayments/today').then(extractData),
};

// ─── Payments ─────────────────────────────────────────────────────────────────
export const paymentsAPI = {
  collect: (data) => api.post('/payments', data).then(extractData),
  collectPenalty: (data) => api.post('/payments/penalty', data).then(extractData),
  collectPrincipal: (data) => api.post('/payments/principal', data).then(extractData),
  close: (data) => api.post('/payments/close', data).then(extractData),
  list: (params) => api.get('/payments', { params }).then(extractData),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  summary: () => api.get('/dashboard/summary').then(extractData),
  agent: (id) => api.get('/dashboard/agent', { params: { agentId: id } }).then(extractData),
  profit: (params) => api.get('/dashboard/profit', { params }).then(extractData),
  resetAllData: () => api.post('/dashboard/reset-all-data').then(extractData),
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportsAPI = {
  defaulters: () => api.get('/reports/defaulters').then(extractData),
  dailyCollection: (params) => api.get('/reports/daily-collection', { params }).then(extractData),
  customer: (id) => api.get(`/customers/${id}`).then(extractData),
};

// ─── Audit ────────────────────────────────────────────────────────────────────
export const auditAPI = {
  list: (params) => api.get('/audit', { params }).then(res => res.data.data),
};

export const notificationsAPI = {
  getDashboard: () => api.get('/notifications/dashboard').then(res => res.data.data),
  getSettings: () => api.get('/notifications/settings').then(res => res.data.data),
  updateSettings: (data) => api.put('/notifications/settings', data).then(res => res.data.data),
  getHistory: (limit) => api.get('/notifications/history', { params: { limit } }).then(res => res.data.data),
  triggerCron: () => api.post('/notifications/trigger').then(res => res.data),
  getInApp: () => api.get('/notifications/in-app').then(res => res.data.data),
  markRead: (id) => api.put(`/notifications/${id}/read`).then(res => res.data)
};

export default api;
export const updateApiBaseUrl = (url) => {
  if (!url) return;
  let clean = url.trim().replace(/^[/=\s]+/, '').replace(/\/+$/, '');
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = 'https://' + clean;
  }
  if (!clean.endsWith('/api')) {
    clean = `${clean}/api`;
  }
  api.defaults.baseURL = clean;
  localStorage.setItem('finova_api_url', clean);
};
