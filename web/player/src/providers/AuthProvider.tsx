import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import {
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  linkWithCredential,
  EmailAuthProvider,
  User
} from 'firebase/auth';
import { auth } from '../firebase';
import { userState, authLoadingState, cookieConsentState } from '../state/auth';
import { CookieConsent } from '../components/CookieConsent';
import logger from '../utils/logger';
import NoFunctionalityScreen from '../components/NoFunctionalityScreen';
import Spinner from '../components/Spinner';

export interface AuthContextType {
  user: User | null;
  error: string | null;
  loading: boolean;
  signInAnon: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  convertAnonToEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAnonymous: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AppProviderProps): JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const setUser = useSetRecoilState(userState);
  const setLoading = useSetRecoilState(authLoadingState);
  const user = useRecoilValue(userState);
  const loading = useRecoilValue(authLoadingState);
  const cookieConsent = useRecoilValue(cookieConsentState);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      logger.debug('Auth state changed', user);
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  const checkCookieConsent = (): void => {
    if (!cookieConsent) {
      throw new Error('Please accept necessary cookies to continue');
    }
  };

  const signInAnon = async (): Promise<void> => {
    try {
      checkCookieConsent();
      setError(null);
      await signInAnonymously(auth);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const signUpWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      checkCookieConsent();
      setError(null);
      await createUserWithEmailAndPassword(auth, email, password);
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

  const convertAnonToEmail = async (email: string, password: string): Promise<void> => {
    try {
      checkCookieConsent();
      setError(null);
      const credential = EmailAuthProvider.credential(email, password);
      if (auth.currentUser) {
        await linkWithCredential(auth.currentUser, credential);
      }
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
    loading,
    signInAnon,
    signUpWithEmail,
    signInWithEmail,
    convertAnonToEmail,
    logout,
    isAnonymous: user?.isAnonymous ?? false,
    isAuthenticated: !!user,
  };

  if (!cookieConsent) {
    return (
      <AuthContext.Provider value={value}>
        <NoFunctionalityScreen>
          <CookieConsent />
        </NoFunctionalityScreen>
      </AuthContext.Provider>
    );
  }

  if (loading) {
    return (
      <AuthContext.Provider value={value}>
        <NoFunctionalityScreen>
          <Spinner text="Loading User"/>
        </NoFunctionalityScreen>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
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
