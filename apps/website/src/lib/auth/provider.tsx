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
import { auth } from '../../components/webplayer/firebase';
import { userDataStore } from '../../components/webplayer/state/userData';
import logger from '../../components/webplayer/utils/logger';
import Spinner from '../../components/webplayer/components/Spinner';
import { RZUser, RZUserData, RZUserType } from '../../components/webplayer/data/model';
import { getUserData } from '../../components/webplayer/data/client';
import CookieConsent from '@/components/CookieConsent';
import LocalStorage from '@/components/webplayer/utils/LocalStorage';

export interface SignIn {
  success: boolean;
  error?: string;
}

export interface SignUp {
  success: boolean;
  error?: string;
}

export interface AuthContextType {
  user: RZUser | null;
  userPromise: Promise<RZUser>;
  signInAnon: () => Promise<SignIn>;
  signUpWithEmail: (email: string, password: string) => Promise<SignUp>;
  signInWithEmail: (email: string, password: string) => Promise<SignIn>;
  convertAnonToEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

type UserPromiseState = {
  userPromise: Promise<RZUser>;
  userPromiseResolve: (user: RZUser) => void;
}

export const AuthProvider = ({ children }: AppProviderProps): JSX.Element => {
  const [user, setUser] = useState<RZUser | null>(null);
  const [cookieConsent, setCookieConsent] = useState<boolean>(
    LocalStorage.getCookieConsent()
  );

  function createNewUserPromise(): UserPromiseState {
    let userPromiseResolve: (user: RZUser) => void = () => { };
    const userPromise = new Promise<RZUser>((resolve) => {
      userPromiseResolve = resolve;
    });

    return {
      userPromise,
      userPromiseResolve
    }
  }

  const [userPromiseState, setUserPromiseState] = useState<UserPromiseState>(() => {
    return {
      userPromise: Promise.resolve(RZUser.nobody()),
      userPromiseResolve: () => { }
    };
  });

  function startNewUserPromise(): void {
    setUserPromiseState(createNewUserPromise());
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user === null) {
        userPromiseState.userPromiseResolve(RZUser.nobody());
        setUser(RZUser.nobody());
        userDataStore.setUserData(RZUserData.empty());
        return;
      }
      setUser(
        new RZUser(
          user.uid,
          user.displayName || '',
          user.photoURL || '',
          user.email || '',
          RZUserType.USER)
      );

      const updateData = async () => {
        const existingUserData = await getUserData(user.uid);
        existingUserData.id = user.uid;
        existingUserData.displayName = user.displayName || null;
        existingUserData.email = user.email || null;
        existingUserData.imageURL = user.photoURL || null;
        existingUserData.createdAt = user.metadata.creationTime ? new Date(user.metadata.creationTime) : null;
        userDataStore.setUserData(existingUserData);
      };
      updateData();
    });

    return () => unsubscribe();
  }, []);

  const checkCookieConsent = (): void => {
    const cookieConsent = LocalStorage.getCookieConsent();
    logger.debug(`Checking cookie consent, value: ${cookieConsent}`);
    if (!cookieConsent) {
      throw new Error('Please accept necessary cookies to continue');
    }
  };

  const signInAnon = async (): Promise<SignIn> => {
    try {
      checkCookieConsent();
      startNewUserPromise();
      const result = await signInAnonymously(auth);
      return {
        success: true
      };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const signUpWithEmail = async (email: string, password: string): Promise<SignUp> => {
    try {
      checkCookieConsent();
      startNewUserPromise();
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return {
        success: true
      };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<SignIn> => {
    try {
      checkCookieConsent();
      startNewUserPromise();
      const result = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true
      };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const convertAnonToEmail = async (email: string, password: string): Promise<void> => {
    try {
      checkCookieConsent();
      const credential = EmailAuthProvider.credential(email, password);
      if (auth.currentUser) {
        await linkWithCredential(auth.currentUser, credential);
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      startNewUserPromise();
      await signOut(auth);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const value: AuthContextType = {
    user,
    userPromise: userPromiseState.userPromise,
    signInAnon,
    signUpWithEmail,
    signInWithEmail,
    convertAnonToEmail,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!cookieConsent ? (
        <CookieConsent />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AppProvider');
  }
  return context;
}
