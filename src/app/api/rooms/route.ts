import { NextRequest, NextResponse } from 'next/server';
import { createServerRoom, getAllServerRooms, getActiveServerRooms, getPastServerRooms } from '@/lib/serverRoomStore';

export async function GET() {
  try {
    const allRooms = getAllServerRooms();
    const activeRooms = getActiveServerRooms();
    const pastRooms = getPastServerRooms();
    return NextResponse.json({ success: true, rooms: allRooms, activeRooms, pastRooms });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal mengambil daftar room' }, { status: 500 });
  }
}

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
