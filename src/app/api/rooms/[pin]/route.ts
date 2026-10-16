import { NextRequest, NextResponse } from 'next/server';
import {
  getServerRoom,
  updateServerPlayer,
  updateServerRoomStatus,
  advanceServerNextRound,
  deleteServerRoom,
} from '@/lib/serverRoomStore';
import { getAuthenticatedTeacher } from '@/lib/authConfig';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { pin: string } }) {
  const pin = String(params.pin || '').trim().slice(0, 12);
  const room = getServerRoom(pin);

  if (!room) {
    return NextResponse.json({ success: false, error: 'Room tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ success: true, room });
}

export async function POST(req: NextRequest, { params }: { params: { pin: string } }) {
  try {
    const pin = String(params.pin || '').trim().slice(0, 12);
    const body = await req.json();
    const { action } = body;

    let updatedRoom = null;

    if (action === 'join') {
      // Siswa dapat bergabung ke room menggunakan PIN
      if (!body.player || typeof body.player !== 'object') {
        return NextResponse.json({ success: false, error: 'Data siswa tidak valid' }, { status: 400 });
      }
      updatedRoom = updateServerPlayer(pin, body.player);
    } else if (action === 'status' || action === 'next-round') {
      // Aksi kontrol jalannya turnamen wajib terautentikasi sebagai Guru
      const teacher = getAuthenticatedTeacher(req);
      if (!teacher) {
        return NextResponse.json(
          { success: false, error: 'Akses ditolak: Hanya Guru yang dapat mengontrol ronde' },
          { status: 403 }
        );
      }

      if (action === 'status') {
        updatedRoom = updateServerRoomStatus(pin, body.status);
      } else {
        updatedRoom = advanceServerNextRound(pin);
      }
    } else {
      return NextResponse.json({ success: false, error: 'Aksi tidak dikenali' }, { status: 400 });
    }

    if (!updatedRoom) {
      return NextResponse.json({ success: false, error: 'Room tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, room: updatedRoom });
  } catch {
    return NextResponse.json({ success: false, error: 'Gagal memperbarui room' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { pin: string } }) {
  try {
    const teacher = getAuthenticatedTeacher(req);
    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Hanya Guru yang dapat menghapus room' },
        { status: 403 }
      );
    }

    const pin = String(params.pin || '').trim().slice(0, 12);
    const deleted = deleteServerRoom(pin);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Room tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Gagal menghapus room' }, { status: 500 });
  }
}
