import { NextRequest, NextResponse } from 'next/server';
import { createServerRoom, getAllServerRooms, getActiveServerRooms, getPastServerRooms } from '@/lib/serverRoomStore';
import { getAuthenticatedTeacher } from '@/lib/authConfig';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const teacher = getAuthenticatedTeacher(req);
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'Akses ditolak: Khusus Guru' }, { status: 401 });
    }

    const allRooms = getAllServerRooms();
    const activeRooms = getActiveServerRooms();
    const pastRooms = getPastServerRooms();
    return NextResponse.json({ success: true, rooms: allRooms, activeRooms, pastRooms });
  } catch {
    return NextResponse.json({ success: false, error: 'Gagal mengambil daftar room' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const teacher = getAuthenticatedTeacher(req);
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'Akses ditolak: Khusus Guru' }, { status: 401 });
    }

    const body = await req.json();
    const { title, hostName, rounds, pin } = body;

    const cleanTitle = String(title || 'Ruang Latihan 10 Jari').trim().slice(0, 80);
    const cleanHost = String(hostName || teacher.name || 'Guru').trim().slice(0, 50);

    const room = createServerRoom(cleanTitle, cleanHost, Array.isArray(rounds) ? rounds.slice(0, 10) : [], pin);
    return NextResponse.json({ success: true, room });
  } catch {
    return NextResponse.json({ success: false, error: 'Gagal membuat room di server' }, { status: 500 });
  }
}
