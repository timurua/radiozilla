'use client';

import { Suspense } from 'react';
import { Login } from '../login';
import { LoginMode } from '../login';

export default function SignInPage() {
  return (
    <Suspense>
      <Login mode={LoginMode.SIGN_IN} />
    </Suspense>
  );
}
