import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported, logEvent, setUserId } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult 
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnOZ21XnoBRowZtkz_BrRFfH1QGdGnnNg",
  authDomain: "finanace-app-3704e.firebaseapp.com",
  projectId: "finanace-app-3704e",
  storageBucket: "finanace-app-3704e.firebasestorage.app",
  messagingSenderId: "790237276359",
  appId: "1:790237276359:web:624ac645f3ed32706eb6e2",
  measurementId: "G-033JB3X4DS"
};

let app = null;
let analytics = null;

function getFirebaseAuth() {
  let firebaseApp;
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
  return getAuth(firebaseApp);
}

/**
 * Check if there is a pending redirect login result from Google
 */
export async function checkGoogleRedirectResult() {
  try {
    const auth = getFirebaseAuth();
    const result = await getRedirectResult(auth);
    if (result?.user) {
      return result.user;
    }
  } catch (err) {
    console.warn('[Firebase] Redirect result check:', err);
  }
  return null;
}

/**
 * Sign In with Google via Firebase Auth popup with fallback to redirect
 */
export async function signInWithGoogleForAdmin() {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    console.warn('[Firebase] signInWithPopup failed/blocked:', err?.code || err?.message);
    if (
      err.code === 'auth/popup-blocked' || 
      err.code === 'auth/popup-closed-by-user' || 
      err.code === 'auth/cancelled-popup-request' ||
      err.message?.includes('Cross-Origin-Opener-Policy') ||
      err.message?.includes('closed')
    ) {
      console.info('[Firebase] Triggering Google Sign-In redirect fallback...');
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw err;
  }
}

/**
 * Initialize Firebase & Analytics strictly for Super Admin sessions only.
 * If user is not Super Admin (e.g. AGENT or CUSTOMER), Firebase will NOT be initialized.
 */
export async function initFirebaseForSuperAdmin(user) {
  // Enforce strict check: ONLY Super Admin (role === 'ADMIN')
  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    // Check if Firebase Analytics is supported in current environment
    const supported = await isSupported();
    if (supported && app) {
      analytics = getAnalytics(app);
      
      // Associate analytics session with superadmin identifier
      if (user.id) {
        setUserId(analytics, String(user.id));
      }

      // Log Super Admin Login Event
      logEvent(analytics, 'superadmin_login', {
        role: 'ADMIN',
        admin_name: user.name || 'Super Admin',
        admin_phone: user.phone || '',
        timestamp: new Date().toISOString()
      });

      console.log('[Firebase] Initialized Analytics exclusively for Super Admin:', user.name || user.phone);
    }

    return { app, analytics };
  } catch (error) {
    console.warn('[Firebase] Analytics initialization error:', error);
    return null;
  }
}

/**
 * Log custom Super Admin actions in Firebase Analytics
 */
export function logSuperAdminEvent(eventName, params = {}) {
  if (analytics) {
    try {
      logEvent(analytics, eventName, {
        role: 'ADMIN',
        ...params
      });
    } catch (err) {
      console.warn('[Firebase] Log event error:', err);
    }
  }
}

export function getFirebaseInstance() {
  return { app, analytics };
}
