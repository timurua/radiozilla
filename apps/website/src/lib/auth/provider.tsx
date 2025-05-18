'use client';

import CookieConsent from '@/components/CookieConsent';
import { upsertUser } from '@/components/webplayer/data/client';
import LocalStorage from '@/components/webplayer/utils/LocalStorage';
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  sendEmailVerification as sendEmailVerificationFirebase
} from 'firebase/auth';
import { createContext, JSX, ReactNode, useContext, useEffect, useState } from 'react';
import { RZUser, RZUserData, RZUserType } from '../../components/webplayer/data/model';
import { auth } from '../../components/webplayer/firebase';
import { userDataStore } from '../../components/webplayer/state/userData';
import logger from '../../components/webplayer/utils/logger';

export interface SignIn {
  success: boolean;
  error?: string;
}

export interface SignUp {
  success: boolean;
  error?: string;
}

export interface AuthContextType {
  user: RZUser;
  userPromise: Promise<RZUser>;
  signInAnon: () => Promise<SignIn>;
  signUpWithEmail: (email: string, password: string) => Promise<SignUp>;
  signInWithEmail: (email: string, password: string) => Promise<SignIn>;
  sendEmailVerification: () => Promise<void>;
  convertAnonToEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
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
  const [user, setUser] = useState<RZUser>(RZUser.nobody());
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

  function setUserAndPromise(user: RZUser): void {
    setUser(user);
    userPromiseState.userPromiseResolve(user);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user === null) {
        setUserAndPromise(RZUser.nobody());
        userDataStore.setUserData(RZUserData.empty());
        return;
      }
      const rzUserType = user.isAnonymous ?
        RZUserType.AUTH_ANONYMOUS :
        (user.emailVerified ?
          RZUserType.AUTH_USER :
          RZUserType.WAITING_EMAIL_VERIFICATION);
      const rzUser = new RZUser(
        0,
        user.uid,
        user.displayName || '',
        "",
        user.photoURL || '',
        user.email || '',
        true,
        new Date(),
        new Date(),
        rzUserType);

      const existingUser = await upsertUser(rzUser);
      setUserAndPromise(existingUser);
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
      await sendEmailVerificationFirebase(result.user);
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

  const sendEmailVerification = async (): Promise<void> => {
    try {
      checkCookieConsent();
      await sendEmailVerificationFirebase(auth.currentUser!);
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

  const signOut = async (): Promise<void> => {
    try {
      startNewUserPromise();
      await firebaseSignOut(auth);
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
    sendEmailVerification,
    convertAnonToEmail,
    signOut: signOut,
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
