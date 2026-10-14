import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/authConfig';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  const teacher = verifySessionToken(token);
  if (!teacher) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({ authenticated: true, teacher });
}
