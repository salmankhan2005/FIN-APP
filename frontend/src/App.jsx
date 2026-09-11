import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import { lazyWithRetry } from './utils/lazyWithRetry';
import './index.css';

// ── Eagerly loaded (always needed immediately) ──────────────────────────────
import AppLayout from './components/AppLayout';
import SplashScreen from './components/SplashScreen';
import LoginPage from './pages/LoginPage';
import RoleSelectionPage from './pages/RoleSelectionPage';


// ── Lazy loaded (only loaded when navigated to) ─────────────────────────────
const Dashboard          = lazyWithRetry(() => import('./pages/Dashboard'));
const CustomersPage      = lazyWithRetry(() => import('./pages/CustomersPage'));
const CustomerDetail     = lazyWithRetry(() => import('./pages/CustomerDetail'));
const LoansPage          = lazyWithRetry(() => import('./pages/LoansPage'));
const LoanDetail         = lazyWithRetry(() => import('./pages/LoanDetail'));
const CreateLoan         = lazyWithRetry(() => import('./pages/CreateLoan'));
const CollectionPage     = lazyWithRetry(() => import('./pages/CollectionPage'));
const UsersPage          = lazyWithRetry(() => import('./pages/UsersPage'));
const SettingsPage       = lazyWithRetry(() => import('./pages/SettingsPage'));
const NotificationsDashboard = lazyWithRetry(() => import('./pages/NotificationsDashboard'));
const ProfitPage         = lazyWithRetry(() => import('./pages/ProfitPage'));
const CollectionRoutePage = lazyWithRetry(() => import('./pages/CollectionRoutePage'));
const PaymentsHistoryPage = lazyWithRetry(() => import('./pages/PaymentsHistoryPage'));
const OnboardingSlides   = lazyWithRetry(() => import('./components/OnboardingSlides'));

const STEP_SPLASH = 'splash';
const STEP_ONBOARDING = 'onboarding';
const STEP_ROLE = 'role';
const STEP_LOGIN = 'login';
const STEP_APP = 'app';

function LoadingFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary, #f8fafc)'
    }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );
}

function AuthenticatedApp() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <LoadingFallback />;
  if (!user)   return <LoadingFallback />;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
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
    </Suspense>
  );
}

function OnboardingGate() {
  const { user, loading, isAuthenticating } = useAuth();

  const [step, setStep] = useState(() => {
    if (user) return STEP_APP;
    const seen = sessionStorage.getItem('finova_onboarding_done') || localStorage.getItem('finova_onboarding_done');
    return seen ? STEP_ROLE : STEP_SPLASH;
  });

  const [selectedRole, setSelectedRole] = useState('ADMIN');

  useEffect(() => {
    if (user) {
      sessionStorage.setItem('finova_onboarding_done', 'true');
      localStorage.setItem('finova_onboarding_done', 'true');
      setStep(STEP_APP);
    } else if (!isAuthenticating && !loading && step === STEP_APP) {
      setStep(STEP_ROLE);
    }
  }, [user, isAuthenticating, loading, step]);

  if (isAuthenticating) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        gap: 16
      }}>
        <div className="spinner" style={{ width: 44, height: 44 }} />
        <p style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: 0 }}>
          Connecting your Google Account...
        </p>
        <span style={{ fontSize: 12.5, color: '#64748b' }}>
          Opening your dashboard securely
        </span>
      </div>
    );
  }

  return (
    <>
      {step === STEP_SPLASH && (
        <SplashScreen onFinish={() => setStep(STEP_ONBOARDING)} duration={1800} />
      )}
      {step === STEP_ONBOARDING && (
        <Suspense fallback={<LoadingFallback />}>
          <OnboardingSlides onFinish={() => setStep(STEP_ROLE)} />
        </Suspense>
      )}
      {step === STEP_ROLE && (
        <RoleSelectionPage
          onSelectRole={(role) => { setSelectedRole(role); setStep(STEP_LOGIN); }}
          onBack={
            !sessionStorage.getItem('finova_onboarding_done') && !localStorage.getItem('finova_onboarding_done')
              ? () => setStep(STEP_ONBOARDING)
              : null
          }
        />
      )}
      {step === STEP_LOGIN && (
        <LoginPage
          selectedRole={selectedRole}
          onBackToHome={() => setStep(STEP_ROLE)}
        />
      )}
      {step === STEP_APP && <AuthenticatedApp />}
      {!step && <LoadingFallback />}
    </>
  );
}

export default function App() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) CapacitorApp.exitApp();
        else window.history.back();
      });
    }
  }, []);

  return (
    <BrowserRouter>
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
          <OnboardingGate />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
