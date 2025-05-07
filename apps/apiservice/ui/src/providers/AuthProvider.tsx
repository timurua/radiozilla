import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../firebase';
import { userState, userLoadingState, cookieConsentState } from '../state/auth';
import { CookieConsent } from '../components/CookieConsent';
import logger from '../utils/logger';
import Spinner from '../components/Spinner';
import { ASUser } from '../data/user';
import SignInOrUp from '../components/SignInOrUp';

export interface AuthContextType {
  user: ASUser | null;
  error: string | null;
  loading: boolean;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AppProviderProps): JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const setUser = useSetRecoilState(userState);
  const setUserLoading = useSetRecoilState(userLoadingState);
  const user = useRecoilValue(userState);
  const userLoading = useRecoilValue(userLoadingState);
  const cookieConsent = useRecoilValue(cookieConsentState);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setUserLoading(false);
      if (user === null) {
        setUser(null);
        return;
      }
      setUser(new ASUser(
        user?.uid ?? '',
        user?.photoURL ?? '',
        user?.displayName ?? '',
        user?.email ?? '',
        true,
      ));
    });

    return () => unsubscribe();
  }, [setUser, setUserLoading]);

  const checkCookieConsent = (): void => {
    logger.debug(`Checking cookie consent, value: ${cookieConsent}`);
    if (!cookieConsent) {
      throw new Error('Please accept necessary cookies to continue');
    }
  };

  const signUpWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      checkCookieConsent();
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      checkCookieConsent();
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const value: AuthContextType = {
    user,
    error,
    loading: userLoading,
    signUpWithEmail,
    signInWithEmail,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!cookieConsent ? (
        <CookieConsent />
      ) : userLoading ? (
        <Spinner text="Loading User" />
      ) : !value.isAuthenticated ? (
        <SignInOrUp />
      ) : (
        children
      )}      
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AppProvider');
  }
  return context;
}
