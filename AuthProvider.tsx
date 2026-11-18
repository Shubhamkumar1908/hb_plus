import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User, onAuthStateChanged, signOut, signInWithPopup, signInWithCredential,
  GoogleAuthProvider, getIdTokenResult
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Platform } from 'react-native';
import { auth, db, googleProvider, isFirebaseConfigured } from '../firebase';
import { isAllowedEmail } from '../config';

type AuthContextValue = {
  user: User | null;
  role: 'admin' | 'user';
  loading: boolean;
  error: string | null;
  loginWithGoogle: (idToken?: string | null) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const RESTRICTED = 'Access restricted. Please login using your official domain email.';
const FIREBASE_SETUP_ERROR =
  'Firebase is not configured. Copy .env.example to .env and add your Firebase web app settings.';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const firebaseAuth = auth;
    const firestore = db;
    if (!firebaseAuth || !firestore) {
      setLoading(false);
      if (!isFirebaseConfigured) setError(FIREBASE_SETUP_ERROR);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null); setRole('user'); setLoading(false); return;
      }
      if (!isAllowedEmail(firebaseUser.email) || !firebaseUser.emailVerified) {
        await signOut(firebaseAuth);
        setUser(null); setRole('user'); setError(RESTRICTED); setLoading(false); return;
      }
      setUser(firebaseUser);
      try {
        const tokenResult = await getIdTokenResult(firebaseUser);
        const isAdmin = tokenResult.claims.admin === true;
        const profileRef = doc(firestore, 'users', firebaseUser.uid);
        const profile = await getDoc(profileRef);
        if (!profile.exists()) {
          await setDoc(profileRef, {
            uid: firebaseUser.uid, email: firebaseUser.email,
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            role: 'user', createdAt: serverTimestamp()
          });
          setRole(isAdmin ? 'admin' : 'user');
        } else {
          setRole(isAdmin ? 'admin' : 'user');
        }
      } catch (e) {
        // Profile reads are non-critical for authentication. Firestore rules still protect data.
        console.warn('Could not load user profile', e);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async (idToken?: string | null) => {
    setLoading(true); setError(null);
    if (!auth) {
      setError(FIREBASE_SETUP_ERROR);
      setLoading(false);
      throw new Error(FIREBASE_SETUP_ERROR);
    }
    try {
      if (Platform.OS === 'web') {
        await signInWithPopup(auth, googleProvider);
      } else {
        if (!idToken) throw new Error('Google sign-in did not return an ID token. Check your OAuth client IDs.');
        const credential = GoogleAuthProvider.credential(idToken);
        const result = await signInWithCredential(auth, credential);
        if (!isAllowedEmail(result.user.email) || !result.user.emailVerified) {
          await signOut(auth);
          throw new Error(RESTRICTED);
        }
      }
    } catch (e: any) {
      const message = e?.message || 'Unable to sign in. Please try again.';
      setError(message.includes('Access restricted') ? RESTRICTED :
        message.includes('popup-closed-by-user') ? 'Sign-in was cancelled. Please try again.' : message);
      setLoading(false);
      throw e;
    }
  };

  const logout = async () => {
    if (auth) await signOut(auth);
    setUser(null); setRole('user'); setError(null);
  };
  const value = useMemo(() => ({ user, role, loading, error, loginWithGoogle, logout, clearError: () => setError(null) }), [user, role, loading, error]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}