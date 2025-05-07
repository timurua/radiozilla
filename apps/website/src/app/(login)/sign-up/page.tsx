import { Suspense } from 'react';
import { Login } from '../login';
import { LoginMode } from '../login';

export default function SignUpPage() {
  return (
    <Suspense>
      <Login mode={LoginMode.SIGN_UP} />
    </Suspense>
  );
}
