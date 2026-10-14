import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/authConfig';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}
