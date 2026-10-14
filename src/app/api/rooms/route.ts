import { NextRequest, NextResponse } from 'next/server';
import { createServerRoom } from '@/lib/serverRoomStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, hostName, rounds, pin } = body;

    const room = createServerRoom(title, hostName, rounds || [], pin);
    return NextResponse.json({ success: true, room });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal membuat room di server' }, { status: 500 });
  }
}
