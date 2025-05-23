'use client';

import CookieConsent from '@/components/CookieConsent';
import { upsertUser, deleteUser as deleteUserDB } from '@/lib/db/client';
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
  sendEmailVerification as sendEmailVerificationFirebase,
  signInWithPopup,
  onIdTokenChanged,
  GoogleAuthProvider,
  updatePassword,
  reauthenticateWithCredential
} from 'firebase/auth';
import { createContext, JSX, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { RZUser, RZUserData, RZUserType, nobody } from '../../components/webplayer/data/model';
import { auth } from '../firebase';
import { userDataStore } from '../../components/webplayer/state/userData';
import logger from '../../components/webplayer/utils/logger';
import { setCookie, deleteCookie } from "cookies-next";

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
  signInWithGoogle: () => Promise<SignIn>;
  sendEmailVerification: () => Promise<void>;
  convertAnonToEmail: (email: string, password: string) => Promise<void>;
  updateUser: (user: RZUser) => Promise<void>;
  updateEmailPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteUser: () => Promise<void>;
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
  const [user, setUser] = useState<RZUser>(nobody);

  const createNewUserPromise = useCallback(() => {
    let userPromiseResolve: (user: RZUser) => void = () => { };
    const userPromise = new Promise<RZUser>((resolve) => {
      userPromiseResolve = resolve;
    });

    return {
      userPromise,
      userPromiseResolve
    }
  }, []);

  const [userPromiseState, setUserPromiseState] = useState<UserPromiseState>(() => {
    return {
      userPromise: Promise.resolve(nobody()),
      userPromiseResolve: () => { }
    };
  });

  const startNewUserPromise = useCallback(() => {
    setUserPromiseState(createNewUserPromise());
  }, [createNewUserPromise]);

  const setUserAndPromise = useCallback((user: RZUser) => {
    setUser(user);
    userPromiseState.userPromiseResolve(user);
  }, [userPromiseState]);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setCookie("__session", token);
        } catch {
          setUserAndPromise(nobody());
        }
      } else {
        deleteCookie("__session");
        setUserAndPromise(nobody());
      }
    });

    return () => unsubscribe();
  }, [setUserAndPromise]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user === null) {
        setUserAndPromise(nobody());
        userDataStore.setUserData(RZUserData.empty());
        return;
      }
      const rzUserType = user.isAnonymous ?
        RZUserType.AUTH_ANONYMOUS :
        (user.emailVerified ?
          RZUserType.AUTH_USER :
          RZUserType.WAITING_EMAIL_VERIFICATION);
      const rzUser = {
        id: 0,
        firebaseUserId: user.uid,
        name: user.displayName || '',
        description: "",
        imageUrl: user.photoURL || '',
        email: user.email || '',
        is_enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userType: rzUserType
      };

      const existingUser = await upsertUser(rzUser);
      setUserAndPromise(existingUser);
    });

    return () => unsubscribe();
  }, [setUserAndPromise]);

  const checkCookieConsent = useCallback(() => {
    const cookieConsent = LocalStorage.getCookieConsent();
    logger.debug(`Checking cookie consent, value: ${cookieConsent}`);
    if (!cookieConsent) {
      throw new Error('Please accept necessary cookies to continue');
    }
  }, []);

  const signInAnon = useCallback(async (): Promise<SignIn> => {
    try {
      checkCookieConsent();
      startNewUserPromise();
      await signInAnonymously(auth);
      return {
        success: true
      };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [checkCookieConsent, startNewUserPromise]);

  const signUpWithEmail = useCallback(async (email: string, password: string): Promise<SignUp> => {
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
  }, [checkCookieConsent, startNewUserPromise]);

  const signInWithEmail = useCallback(async (email: string, password: string): Promise<SignIn> => {
    try {
      checkCookieConsent();
      startNewUserPromise();
      await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true
      };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [checkCookieConsent, startNewUserPromise]);

  const signInWithGoogle = useCallback(async (): Promise<SignIn> => {
    try {
      checkCookieConsent();
      startNewUserPromise();
      const provider = new GoogleAuthProvider();

      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Error signing in with Google", error);
      }
      return {
        success: true
      };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [checkCookieConsent, startNewUserPromise]);

  const updateUser = useCallback(async (user: RZUser): Promise<void> => {
    try {
      const newUser = await upsertUser(user);
      setUser(newUser);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [setUser]);

  const updateEmailPassword = useCallback(async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not found');
      }
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred');
    }
  }, []);

  const deleteUser = useCallback(async (): Promise<void> => {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        throw new Error('User not found');
      }
      await deleteUserDB(user.id);
      await firebaseUser.delete();

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [user]);

  const sendEmailVerification = useCallback(async (): Promise<void> => {
    try {
      checkCookieConsent();
      await sendEmailVerificationFirebase(auth.currentUser!);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [checkCookieConsent]);

  const convertAnonToEmail = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      checkCookieConsent();
      const credential = EmailAuthProvider.credential(email, password);
      if (auth.currentUser) {
        await linkWithCredential(auth.currentUser, credential);
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [checkCookieConsent]);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      startNewUserPromise();
      await firebaseSignOut(auth);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [startNewUserPromise]);

  const value: AuthContextType = {
    user,
    userPromise: userPromiseState.userPromise,
    signInAnon,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    sendEmailVerification,
    convertAnonToEmail,
    updateUser,
    updateEmailPassword,
    deleteUser,
    signOut: signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!LocalStorage.getCookieConsent() ? (
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

type UserContextType = {
  userPromise: Promise<RZUser | null>;
};

const UserContext = createContext<UserContextType | null>(null);

export function useUser(): UserContextType {
  let context = useContext(UserContext);
  if (context === null) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function UserProvider({
  children,
  userPromise
}: {
  children: ReactNode;
  userPromise: Promise<RZUser | null>;
}) {
  return (
    <UserContext.Provider value={{ userPromise }}>
      {children}
    </UserContext.Provider>
  );
}

