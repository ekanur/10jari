import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/authConfig';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Abaikan halaman login itu sendiri dan endpoint autentikasi
  if (pathname === '/teacher/login' || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Lindungi seluruh rute /teacher dengan verifikasi tanda tangan HMAC-SHA256
  if (pathname.startsWith('/teacher')) {
    const sessionCookie = req.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      const loginUrl = new URL('/teacher/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const validTeacher = verifySessionToken(sessionCookie);
    if (!validTeacher) {
      const loginUrl = new URL('/teacher/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/teacher', '/teacher/:path*'],
};
