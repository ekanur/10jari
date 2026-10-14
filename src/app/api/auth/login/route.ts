import { NextRequest, NextResponse } from 'next/server';
import { TEACHER_ACCOUNTS, AUTH_COOKIE_NAME, generateSessionToken } from '@/lib/authConfig';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const cleanEmail = (email || '').trim().toLowerCase();
    const account = TEACHER_ACCOUNTS[cleanEmail];

    if (!account || account.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Email atau kata sandi guru tidak sesuai.' },
        { status: 401 }
      );
    }

    const token = generateSessionToken(account.user);
    const response = NextResponse.json({
      success: true,
      teacher: account.user,
    });

    // Set cookie sesi HTTP
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: false, // agar dapat dicek di client dan middleware
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 hari
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan sistem saat login' }, { status: 500 });
  }
}
