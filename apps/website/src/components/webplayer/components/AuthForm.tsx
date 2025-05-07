import React, { JSX, useState } from 'react';
import { useAuth } from '../../../lib/auth/provider';

export function AuthForm(): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user, signUpWithEmail, signInWithEmail, convertAnonToEmail, logout, isAnonymous } = useAuth();

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    action: 'signup' | 'signin' | 'convert'
  ): Promise<void> => {
    e.preventDefault();
    switch (action) {
      case 'signup':
        await signUpWithEmail(email, password);
        break;
      case 'signin':
        await signInWithEmail(email, password);
        break;
      case 'convert':
        await convertAnonToEmail(email, password);
        break;
    }
  };

  if (user) {
    return (
      <div>
        <p>Welcome, {user.email || 'Anonymous User'}</p>
        {isAnonymous && (
          <form onSubmit={(e) => handleSubmit(e, 'convert')}>
            <h3>Convert to Email Account</h3>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="border p-2 mr-2"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="border p-2 mr-2"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Convert Account
            </button>
          </form>
        )}
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded mt-4"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Form components remain the same, just add proper types */}
    </div>
  );
}