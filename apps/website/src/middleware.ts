import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthenticatedAppForUser } from './lib/server/firebase';

const protectedRoutes = '/dashboard';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { currentUser } = await getAuthenticatedAppForUser();

  const isProtectedRoute = pathname.startsWith(protectedRoutes);

  if (isProtectedRoute && !currentUser) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  const res = NextResponse.next();
  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
