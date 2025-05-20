import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { AuthProvider } from '@/lib/auth/provider';
import CookieConsent from '@/components/CookieConsent';
import MobxProvider from '@/components/webplayer/state/provider';
import { FrontEndUserProvider } from '@/lib/webplayer/provider';

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
        <MobxProvider>
          <AuthProvider>
            <FrontEndUserProvider>
              {children}
            </FrontEndUserProvider>
          </AuthProvider>
        </MobxProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
