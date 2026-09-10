import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import CustomersPage from './pages/CustomersPage';
import CustomerDetail from './pages/CustomerDetail';
import LoansPage from './pages/LoansPage';
import LoanDetail from './pages/LoanDetail';
import CreateLoan from './pages/CreateLoan';
import CollectionPage from './pages/CollectionPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import SplashScreen from './components/SplashScreen';
import NotificationsDashboard from './pages/NotificationsDashboard';
import ProfitPage from './pages/ProfitPage';
import CollectionRoutePage from './pages/CollectionRoutePage';
import PaymentsHistoryPage from './pages/PaymentsHistoryPage';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

function AppRoutes() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="loading-page"><div className="spinner" /><p>Loading...</p></div>;

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onBackToHome={() => navigate('/')} />} />
        <Route path="*" element={<LandingPage onOpenLogin={() => navigate('/login')} />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/welcome" element={<LandingPage onOpenLogin={() => navigate('/')} />} />
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="loans" element={<LoansPage />} />
        <Route path="loans/create" element={<CreateLoan />} />
        <Route path="loans/:id" element={<LoanDetail />} />
        <Route path="collections" element={<CollectionPage />} />
        <Route path="notifications" element={<NotificationsDashboard />} />
        <Route path="users" element={isAdmin ? <UsersPage /> : <Navigate to="/" replace />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profit" element={isAdmin ? <ProfitPage /> : <Navigate to="/" replace />} />
        <Route path="payment-history" element={isAdmin ? <PaymentsHistoryPage /> : <Navigate to="/" replace />} />
        <Route path="collection-route" element={<CollectionRoutePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('finova_splash_seen');
  });

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) CapacitorApp.exitApp();
        else window.history.back();
      });
    }
  }, []);

  const handleSplashFinish = () => {
    sessionStorage.setItem('finova_splash_seen', 'true');
    setShowSplash(false);
  };

  return (
    <BrowserRouter>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <AuthProvider>
        <ScrollToTop />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
              fontSize: '13px',
              maxWidth: '90vw',
              wordBreak: 'break-word',
            },
          }}
          containerStyle={{ top: 60 }}
          visibleToasts={2}
        />
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
