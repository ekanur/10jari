import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Abaikan halaman login itu sendiri dan endpoint statis/publik
  if (pathname === '/teacher/login' || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Lindungi seluruh rute /teacher
  if (pathname.startsWith('/teacher')) {
    const sessionCookie = req.cookies.get('typearena_teacher_session')?.value;

    if (!sessionCookie) {
      const loginUrl = new URL('/teacher/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verifikasi token base64 sederhana di Edge runtime
      const raw = atob(sessionCookie);
      const payload = JSON.parse(raw);
      if (payload.exp && Date.now() > payload.exp) {
        const loginUrl = new URL('/teacher/login', req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL('/teacher/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/teacher', '/teacher/:path*'],
};
