import { NextRequest } from 'next/server';
import { addSSEClient, removeSSEClient } from '@/lib/serverRoomStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { pin: string } }) {
  const pin = params.pin;
  const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const stream = new ReadableStream({
    start(controller) {
      addSSEClient(pin, clientId, controller);
    },
    cancel() {
      removeSSEClient(pin, clientId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
