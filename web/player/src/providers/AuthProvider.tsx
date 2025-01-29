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
import { userState, userLoadingState, cookieConsentState, isOnlineState } from '../state/auth';
import { CookieConsent } from '../components/CookieConsent';
import logger from '../utils/logger';
import NoPlayerScreen from '../components/NoPlayerScreen';
import Spinner from '../components/Spinner';
import { RZUser } from '../data/model';

export interface AuthContextType {
  user: RZUser | null;
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
  const setUserLoading = useSetRecoilState(userLoadingState);
  const user = useRecoilValue(userState);
  const userLoading = useRecoilValue(userLoadingState);
  const cookieConsent = useRecoilValue(cookieConsentState);
  const isOnline = useRecoilValue(isOnlineState);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setUserLoading(false);
      if(user === null) {
        setUser(null);
        return;
      }      
      setUser(new RZUser(
        user?.uid ?? '',
        user?.email ?? '',
        user?.displayName ?? '',
        user?.photoURL ?? '',
        user?.isAnonymous ?? false,
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

  useEffect(() => {
    if (!cookieConsent) {
      return;
    }
    if (userLoading) {
      return;
    }
    if(!isOnline) {
      return;
    }
    if (user === null) {
      logger.debug('No user found, signing in anonymously');
      signInAnon();      
      return;
    }
    
  }, [userLoading, user, cookieConsent, isOnline, signInAnon]);


  const value: AuthContextType = {
    user,
    error,
    loading: userLoading,
    signInAnon,
    signUpWithEmail,
    signInWithEmail,
    convertAnonToEmail,
    logout,
    isAnonymous: user?.isAnonymous ?? false,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!cookieConsent ? (
        <NoPlayerScreen>
          <CookieConsent />
        </NoPlayerScreen>
      ) : userLoading ? (
        <NoPlayerScreen>
          <Spinner text="Loading User" />
        </NoPlayerScreen>
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
