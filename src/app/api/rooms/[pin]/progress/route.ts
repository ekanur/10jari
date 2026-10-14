import { NextRequest, NextResponse } from 'next/server';
import { updateServerPlayerProgress } from '@/lib/serverRoomStore';

export async function POST(req: NextRequest, { params }: { params: { pin: string } }) {
  try {
    const pin = params.pin;
    const body = await req.json();
    const { playerId, progress, currentWpm, netWpm, accuracy, completed } = body;

    const room = updateServerPlayerProgress(
      pin,
      playerId,
      progress,
      currentWpm,
      netWpm,
      accuracy,
      completed
    );

    if (!room) {
      return NextResponse.json({ success: false, error: 'Room tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal update progress' }, { status: 500 });
  }
}
