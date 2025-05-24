'use client';

import CookieConsent from '@/components/CookieConsent';
import { deleteUser as deleteUserDB } from '@/lib/db/client';
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
import { createContext, JSX, ReactNode, useCallback, useContext, useEffect } from 'react';
import { RZUser, RZUserType } from '../../components/webplayer/data/model';
import { auth } from '../firebase';
import logger from '../../components/webplayer/utils/logger';
import { setCookie, deleteCookie } from "cookies-next";
import { useResetUser, useUpsertUser } from '../query/hooks';

export interface SignIn {
  success: boolean;
  error?: string;
}

export interface SignUp {
  success: boolean;
  error?: string;
}

export interface AuthContextType {
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

export const AuthProvider = ({ children }: AppProviderProps): JSX.Element => {
  const upsertUserMutation = useUpsertUser();
  const resetUserMutation = useResetUser();



  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setCookie("__session", token);
        } catch {
          deleteCookie("__session");
        }
      } else {
        deleteCookie("__session");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user === null) {
        resetUserMutation();
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
      upsertUserMutation.mutate(rzUser);
    });

    return () => {
      unsubscribe();
    };
  }, []);

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
      await signInAnonymously(auth);
      return {
        success: true
      };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [checkCookieConsent]);

  const signUpWithEmail = useCallback(async (email: string, password: string): Promise<SignUp> => {
    try {
      checkCookieConsent();
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerificationFirebase(result.user);
      return {
        success: true
      };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [checkCookieConsent]);

  const signInWithEmail = useCallback(async (email: string, password: string): Promise<SignIn> => {
    try {
      checkCookieConsent();
      await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true
      };
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [checkCookieConsent]);

  const signInWithGoogle = useCallback(async (): Promise<SignIn> => {
    try {
      checkCookieConsent();
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
  }, [checkCookieConsent]);

  const updateUser = useCallback(async (user: RZUser): Promise<void> => {
    try {
      await upsertUserMutation.mutateAsync(user);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [upsertUserMutation]);

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
      await deleteUserDB();
      await firebaseUser.delete();

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred');
    }
  }, []);

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
      resetUserMutation();
      await firebaseSignOut(auth);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [resetUserMutation]);

  const value: AuthContextType = {
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


