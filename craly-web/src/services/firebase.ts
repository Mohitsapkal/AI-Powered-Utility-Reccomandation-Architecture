import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBQfyjMHQDr-McSK0f5vaYgxeqysmWTUDQ',
  authDomain: 'craly-ai.firebaseapp.com',
  projectId: 'craly-ai',
  storageBucket: 'craly-ai.firebasestorage.app',
  messagingSenderId: '1056539490760',
  appId: '1:1056539490760:web:d2bf3e56a73c1588de8fd',
};

// Initialize Firebase App singleton safely (works across Next.js SSR and client)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export interface FirebaseAuthResult {
  success: boolean;
  idToken?: string;
  user?: User;
  message?: string;
}

/**
 * Sign in using Firebase with email & password, returning the fresh idToken.
 * Includes a REST fallback for resilient connectivity across all browser environments.
 */
export async function getFirebaseIdTokenFromCredentials(
  email: string,
  pass: string
): Promise<FirebaseAuthResult> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const idToken = await cred.user.getIdToken(true);
    return {
      success: true,
      idToken,
      user: cred.user,
    };
  } catch (sdkErr: any) {
    console.warn('[Firebase SDK] signInWithEmailAndPassword failed, trying Identity Toolkit REST fallback:', sdkErr.message);

    // Fallback directly to Firebase Identity Toolkit REST API
    try {
      const restRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password: pass,
            returnSecureToken: true,
          }),
        }
      );

      const restData = await restRes.json();
      if (!restRes.ok || !restData.idToken) {
        let msg = restData?.error?.message || sdkErr?.message || 'Authentication failed.';
        if (msg.includes('INVALID_LOGIN_CREDENTIALS') || msg.includes('EMAIL_NOT_FOUND') || msg.includes('INVALID_PASSWORD')) {
          msg = 'Invalid email or password. Please try again.';
        } else if (msg.includes('USER_DISABLED')) {
          msg = 'This account has been disabled.';
        } else if (msg.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) {
          msg = 'Access temporarily disabled due to many failed login attempts. Reset your password or try again later.';
        }
        return { success: false, message: msg };
      }

      return {
        success: true,
        idToken: restData.idToken,
      };
    } catch (fallbackErr: any) {
      return {
        success: false,
        message: sdkErr?.message || fallbackErr?.message || 'Failed to authenticate with Firebase.',
      };
    }
  }
}

/**
 * Sign in with Google Popup and obtain Firebase idToken
 */
export async function getFirebaseIdTokenFromGoogle(): Promise<FirebaseAuthResult> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    const idToken = await cred.user.getIdToken(true);
    return {
      success: true,
      idToken,
      user: cred.user,
    };
  } catch (err: any) {
    let msg = err.message || 'Google sign-in failed.';
    if (err.code === 'auth/popup-closed-by-user') {
      msg = 'Sign-in window was closed before completing.';
    } else if (err.code === 'auth/popup-blocked') {
      msg = 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    }
    return { success: false, message: msg };
  }
}

/**
 * Register user in Firebase directly or create token
 */
export async function createFirebaseUser(
  email: string,
  pass: string,
  displayName: string
): Promise<FirebaseAuthResult> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (displayName && cred.user) {
      try {
        await firebaseUpdateProfile(cred.user, { displayName });
      } catch {}
    }
    const idToken = await cred.user.getIdToken(true);
    return {
      success: true,
      idToken,
      user: cred.user,
    };
  } catch (sdkErr: any) {
    // If user already exists in Firebase, try logging in
    if (sdkErr.code === 'auth/email-already-in-use') {
      return getFirebaseIdTokenFromCredentials(email, pass);
    }

    // Identity Toolkit REST fallback
    try {
      const restRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            password: pass,
            returnSecureToken: true,
          }),
        }
      );
      const restData = await restRes.json();
      if (!restRes.ok || !restData.idToken) {
        return {
          success: false,
          message: restData?.error?.message || sdkErr?.message || 'Failed to register with Firebase.',
        };
      }
      return { success: true, idToken: restData.idToken };
    } catch {
      return { success: false, message: sdkErr.message || 'Failed to register.' };
    }
  }
}

/**
 * Send password reset email
 */
export async function resetFirebasePassword(email: string): Promise<{ success: boolean; message?: string }> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return { success: true };
  } catch (err: any) {
    // Fallback to REST
    try {
      const res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseConfig.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestType: 'PASSWORD_RESET',
            email: email.trim(),
          }),
        }
      );
      if (res.ok) return { success: true };
      const data = await res.json();
      return { success: false, message: data?.error?.message || err.message };
    } catch {
      return { success: false, message: err.message || 'Failed to send password reset email.' };
    }
  }
}

/**
 * Sign out of Firebase
 */
export async function signOutFirebase(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch {}
}
