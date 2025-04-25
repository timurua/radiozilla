'use client';

import React, { useEffect, useState } from 'react';

const COOKIE_KEY = 'cookie_consent_accepted';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent =
      typeof window !== 'undefined' && localStorage.getItem(COOKIE_KEY);
    setVisible(consent !== 'true');
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 w-full bg-background text-foreground p-4 flex justify-between items-center z-[1000] border-t border-border"
      role="dialog"
      aria-live="polite"
    >
      <span className="mr-4">
        This website uses cookies to enhance the user experience. By continuing to use the site, you accept our use of cookies.
      </span>
      <button
        onClick={acceptCookies}
        className="bg-primary text-primary-foreground rounded px-4 py-2 font-medium shadow hover:bg-primary/90 transition-colors"
      >
        Accept
      </button>
    </div>
  );
}
