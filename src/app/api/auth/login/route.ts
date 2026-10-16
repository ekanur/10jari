import { NextRequest, NextResponse } from 'next/server';
import { getTeacherAccounts, AUTH_COOKIE_NAME, generateSessionToken } from '@/lib/authConfig';

// Rate limiter sederhana di memori untuk mencegah brute-force login
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 5 * 60 * 1000; // 5 menit

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    const now = Date.now();
    const attempt = loginAttempts.get(clientIp);
    if (attempt && now < attempt.resetAt && attempt.count >= MAX_ATTEMPTS) {
      const waitSec = Math.ceil((attempt.resetAt - now) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Terlalu banyak percobaan login gagal. Silakan coba lagi dalam ${waitSec} detik.`,
        },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();

    const cleanEmail = String(email || '').trim().toLowerCase();
    const accounts = getTeacherAccounts();
    const account = accounts[cleanEmail];

    if (!account || account.password !== String(password || '')) {
      const prevCount = attempt && now < attempt.resetAt ? attempt.count : 0;
      loginAttempts.set(clientIp, {
        count: prevCount + 1,
        resetAt: now + WINDOW_MS,
      });

      return NextResponse.json(
        { success: false, error: 'Email atau kata sandi guru tidak sesuai.' },
        { status: 401 }
      );
    }

    // Reset catatan gagal setelah berhasil login
    loginAttempts.delete(clientIp);

    const token = generateSessionToken(account.user);
    const response = NextResponse.json({
      success: true,
      teacher: account.user,
    });

    // Set cookie sesi HTTP dengan proteksi HttpOnly untuk mencegah pencurian via XSS
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 hari
      sameSite: 'lax',
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan sistem saat login' }, { status: 500 });
  }
}
