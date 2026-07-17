import { useState, useEffect } from 'react';
import { auth } from '../../../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User
} from 'firebase/auth';
import { setUserRole, getUserRole } from '../../../lib/firebase';

/**
 * Custom hook for Ops Dashboard Firebase authentication
 * Manages auth state, login, signup, and role verification
 */
export function useOpsAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      const handleAuthState = async () => {
        setUser(currentUser);
        if (currentUser) {
          setIsAuthLoading(true);
          const userRole = await getUserRole(currentUser.uid);
          setRole(userRole);
          setIsAuthLoading(false);
        } else {
          setRole(null);
          setIsAuthLoading(false);
        }
      };
      handleAuthState().catch((err: unknown) => {
        console.error('Error verifying auth state:', err);
        setIsAuthLoading(false);
      });
    });
    return () => unsubscribe();
  }, []);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!email.trim() || !password) return;

    try {
      setIsAuthLoading(true);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const userRole = await getUserRole(cred.user.uid);
      setRole(userRole);
      if (userRole !== 'staff') {
        setAuthError('Access denied. Staff credentials required.');
        await signOut(auth);
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed.';
      setAuthError(errorMessage);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handle Sign Up (CRITICAL: defaults to 'fan' role per privilege-escalation fix)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!email.trim() || !password) return;

    try {
      setIsAuthLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // New users default to 'fan' role. Staff access must be granted manually via Firebase Console.
      await setUserRole(cred.user.uid, email, 'fan');
      setRole('fan');
      setAuthError('Account created as Fan. Staff access requires manual elevation via Firebase Console.');
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed.';
      setAuthError(errorMessage);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return {
    user,
    role,
    isAuthLoading,
    authError,
    isSignUp,
    email,
    password,
    setIsSignUp,
    setEmail,
    setPassword,
    setAuthError,
    handleLogin,
    handleSignUp,
    handleSignOut
  };
}
