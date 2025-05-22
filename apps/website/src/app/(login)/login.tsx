'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RZUserType } from '@/components/webplayer/data/model';
import { useAuth } from '@/lib/auth/provider';
import { CircleIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export enum LoginMode {
  SIGN_IN = 'signin',
  SIGN_UP = 'signup'
}

export enum LoginState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

export function Login({ mode }: { mode: LoginMode }) {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const priceId = searchParams.get('priceId');
  const inviteId = searchParams.get('inviteId');
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<LoginState>(LoginState.IDLE);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user, signInWithEmail, signUpWithEmail, sendEmailVerification } = useAuth();
  const router = useRouter();

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmitSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (password.length < 6) {
      setState(LoginState.ERROR);
      return setError('Password must be at least 6 characters');
    }

    try {
      setState(LoginState.LOADING);
      await signUpWithEmail(email, password);
      setState(LoginState.SUCCESS);
      // Clear form
      setEmail('');
      setPassword('');
    } catch (err) {
      setState(LoginState.ERROR);
      if (err && typeof err === 'object' && 'code' in err) {
        const firebaseError = err as { code: string; message?: string };
        if (firebaseError.code === 'auth/email-already-in-use') {
          setError('Email is already in use');
        } else if (firebaseError.code === 'auth/invalid-email') {
          setError('Invalid email address');
        } else {
          setError(firebaseError.message || 'An error occurred');
        }
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  const handleSubmitSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setState(LoginState.LOADING);
      await signInWithEmail(email, password);
      setState(LoginState.SUCCESS);
      router.push('/');
    } catch {
      setState(LoginState.ERROR);
      setError('Invalid credentials. Please try again.');
    }
  };

  if (user.userType === RZUserType.WAITING_EMAIL_VERIFICATION) {
    return (
      <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <CircleIcon className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            Verify your email address
          </h2>
          <p className="text-center text-sm text-foreground-light">
            A verification email has been sent to your email address. Please check your email and follow the instructions to verify your email address.
          </p>
          <div className="mt-4 flex justify-center">
            <Button
              onClick={async () => {
                try {
                  setState(LoginState.LOADING);
                  await sendEmailVerification();
                  setState(LoginState.SUCCESS);
                } catch (err) {
                  setState(LoginState.ERROR);
                  setError(err instanceof Error ? err.message : 'An unknown error occurred');
                }
              }}
              variant="outline"
            >
              Resend verification email
            </Button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <CircleIcon className="h-12 w-12 text-primary" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          {mode === LoginMode.SIGN_IN
            ? 'Sign in to your account'
            : 'Create your account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-6" onSubmit={mode === LoginMode.SIGN_IN ? handleSubmitSignIn : handleSubmitSignUp}>
          <input type="hidden" name="redirect" value={redirect || ''} />
          <input type="hidden" name="priceId" value={priceId || ''} />
          <input type="hidden" name="inviteId" value={inviteId || ''} />
          <div>
            <Label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              Email
            </Label>
            <div className="mt-1">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={email}
                required
                maxLength={50}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-input placeholder-muted-foreground text-foreground focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Enter your email"
                onChange={handleEmailChange}
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="password"
              className="block text-sm font-medium text-foreground"
            >
              Password
            </Label>
            <div className="mt-1">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  mode === LoginMode.SIGN_IN ? 'current-password' : 'new-password'
                }
                defaultValue={password}
                required
                minLength={8}
                maxLength={100}
                className="appearance-none rounded-full relative block w-full px-3 py-2 border border-input placeholder-muted-foreground text-foreground focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Enter your password"
                onChange={handlePasswordChange}
              />
            </div>
          </div>

          {error && (
            <div className="text-destructive text-sm">{error}</div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              disabled={state === LoginState.LOADING}
            >
              {state === LoginState.LOADING ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Loading...
                </>
              ) : mode === LoginMode.SIGN_IN ? (
                'Sign in'
              ) : (
                'Sign up'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                {mode === 'signin'
                  ? 'New to our platform?'
                  : 'Already have an account?'}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href={`${mode === LoginMode.SIGN_IN ? '/sign-up' : '/sign-in'}${redirect ? `?redirect=${redirect}` : ''
                }${priceId ? `&priceId=${priceId}` : ''}`}
              className="w-full flex justify-center py-2 px-4 border border-input rounded-full shadow-sm text-sm font-medium text-foreground bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {mode === LoginMode.SIGN_IN
                ? 'Create an account'
                : 'Sign in to existing account'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
