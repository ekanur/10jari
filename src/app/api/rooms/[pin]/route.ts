import { NextRequest, NextResponse } from 'next/server';
import {
  getServerRoom,
  updateServerPlayer,
  updateServerRoomStatus,
  advanceServerNextRound,
} from '@/lib/serverRoomStore';

export async function GET(req: NextRequest, { params }: { params: { pin: string } }) {
  const pin = params.pin;
  const room = getServerRoom(pin);

  if (!room) {
    return NextResponse.json({ success: false, error: 'Room tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ success: true, room });
}

export async function POST(req: NextRequest, { params }: { params: { pin: string } }) {
  try {
    const pin = params.pin;
    const body = await req.json();
    const { action } = body;

    let updatedRoom = null;

    if (action === 'join') {
      updatedRoom = updateServerPlayer(pin, body.player);
    } else if (action === 'status') {
      updatedRoom = updateServerRoomStatus(pin, body.status);
    } else if (action === 'next-round') {
      updatedRoom = advanceServerNextRound(pin);
    }

    if (!updatedRoom) {
      return NextResponse.json({ success: false, error: 'Room tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, room: updatedRoom });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal memperbarui room' }, { status: 500 });
  }
}
