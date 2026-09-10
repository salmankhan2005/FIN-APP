import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import RoleSelectionPage from './pages/RoleSelectionPage';
import SplashScreen from './components/SplashScreen';
import OnboardingSlides from './components/OnboardingSlides';
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

const STEP_SPLASH = 'splash';
const STEP_ONBOARDING = 'onboarding';
const STEP_ROLE = 'role';
const STEP_LOGIN = 'login';
const STEP_APP = 'app';

function AuthenticatedApp() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  // If not authenticated, show nothing (App manages onboarding/login overlay)
  if (!user) return null;

  return (
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
  );
}

function OnboardingGate() {
  const { user } = useAuth();

  const [step, setStep] = useState(() => {
    // If already logged in, skip onboarding
    if (user) return STEP_APP;
    const seen = sessionStorage.getItem('finova_onboarding_done');
    return seen ? STEP_ROLE : STEP_SPLASH;
  });

  const [selectedRole, setSelectedRole] = useState('ADMIN');

  // When user logs in, advance to app
  useEffect(() => {
    if (user && step !== STEP_APP) {
      sessionStorage.setItem('finova_onboarding_done', 'true');
      setStep(STEP_APP);
    }
  }, [user]);

  return (
    <>
      {/* Onboarding overlays */}
      {step === STEP_SPLASH && (
        <SplashScreen onFinish={() => setStep(STEP_ONBOARDING)} duration={2400} />
      )}
      {step === STEP_ONBOARDING && (
        <OnboardingSlides onFinish={() => setStep(STEP_ROLE)} />
      )}
      {step === STEP_ROLE && (
        <RoleSelectionPage
          onSelectRole={(role) => { setSelectedRole(role); setStep(STEP_LOGIN); }}
          onBack={step === STEP_ROLE && !sessionStorage.getItem('finova_onboarding_done')
            ? () => setStep(STEP_ONBOARDING)
            : null}
        />
      )}
      {step === STEP_LOGIN && (
        <LoginPage
          selectedRole={selectedRole}
          onBackToHome={() => setStep(STEP_ROLE)}
        />
      )}

      {/* Authenticated app is always rendered underneath so auth context works */}
      {step === STEP_APP && <AuthenticatedApp />}
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
