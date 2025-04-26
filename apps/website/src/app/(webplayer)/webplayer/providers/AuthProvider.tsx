'use client';

import { createContext, useContext, useEffect, useState, ReactNode, JSX } from 'react';
import { observer } from "mobx-react-lite";
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
import { authStore } from '../state/auth';
import { userDataStore } from '../state/userData';
import logger from '../utils/logger';
import NoPlayerScreen from '../components/NoPlayerScreen';
import Spinner from '../components/Spinner';
import { RZUser, RZUserData } from '../data/model';
import { getUserData } from '../data/actions';
import { CookieConsent } from '../components/CookieConsent';

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

export const AuthProvider = observer(function AuthProvider({ children }: AppProviderProps): JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const user = authStore.user;
  const userLoading = authStore.userLoading;
  const cookieConsent = authStore.cookieConsent;
  const isOnline = authStore.isOnline;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      authStore.setUser(user as any);
      authStore.setUserLoading(false);
      if (user === null) {
        userDataStore.setUserData(RZUserData.empty());
        return;
      }
      const updateData = async () => {
        userDataStore.setUserData(
          await getUserData(user.uid)
        );
      };
      updateData();
    });

    return () => unsubscribe();
  }, []);

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
    if (!isOnline) {
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
});

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AppProvider');
  }
  return context;
}
