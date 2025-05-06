import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { UserProvider } from '@/lib/auth';
import { getUser } from '@/lib/db/queries';
import CookieConsent from '@/components/CookieConsent';

export const metadata: Metadata = {
  title: 'Radiozilla - AI Radio',
  description: 'Create and listen to your own AI-powered radio station',
};

export const viewport: Viewport = {
  maximumScale: 1,
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userPromise = getUser();

  return (
    <html
      lang="en"
      className={`${manrope.className}`}
    >
      <head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/radiozilla.svg" />
      </head>
      <body className="min-h-[100dvh] bg-background text-foreground dark" style={{ colorScheme: 'dark' }}>
        <UserProvider userPromise={userPromise}>{children}</UserProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
