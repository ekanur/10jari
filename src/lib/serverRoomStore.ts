import { LiveRoom, PlayerState, RoomStatus, QuizRound } from '@/types';

// Global room store in memory on Next.js server
// Using globalThis so it persists across Next.js dev server hot-reloads
interface SSEClient {
  id: string;
  controller: ReadableStreamDefaultController;
}

interface ServerRoomData {
  room: LiveRoom;
  clients: SSEClient[];
}

declare global {
  // eslint-disable-next-line no-var
  var __TYPEARENA_ROOMS__: Map<string, ServerRoomData> | undefined;
}

const rooms = globalThis.__TYPEARENA_ROOMS__ || new Map<string, ServerRoomData>();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__TYPEARENA_ROOMS__ = rooms;
}

export function createServerRoom(title: string, hostName: string, rounds: QuizRound[], customPin?: string): LiveRoom {
  const pin = customPin || Math.floor(100000 + Math.random() * 900000).toString();
  const room: LiveRoom = {
    pin,
    title,
    hostName,
    status: 'lobby',
    currentRoundIndex: 0,
    rounds,
    players: {},
    countdownSeconds: 3,
    createdAt: Date.now(),
  };

  rooms.set(pin, {
    room,
    clients: [],
  });

  return room;
}

export function getServerRoom(pin: string): LiveRoom | null {
  const data = rooms.get(pin);
  return data ? data.room : null;
}

export function broadcastRoomUpdate(pin: string, room: LiveRoom) {
  const data = rooms.get(pin);
  if (!data) return;

  data.room = room;
  const message = `data: ${JSON.stringify(room)}\n\n`;
  const encoder = new TextEncoder();

  // Kirim ke semua klien SSE yang terhubung
  data.clients = data.clients.filter((client) => {
    try {
      client.controller.enqueue(encoder.encode(message));
      return true;
    } catch {
      return false; // Hapus klien yang disconnect
    }
  });
}

export function addSSEClient(pin: string, clientId: string, controller: ReadableStreamDefaultController) {
  let data = rooms.get(pin);
  if (!data) {
    // Buat placeholder jika room belum terdaftar
    const newRoom: LiveRoom = {
      pin,
      title: 'Ruang Latihan',
      hostName: 'Guru',
      status: 'lobby',
      currentRoundIndex: 0,
      rounds: [],
      players: {},
      countdownSeconds: 3,
      createdAt: Date.now(),
    };
    data = { room: newRoom, clients: [] };
    rooms.set(pin, data);
  }

  data.clients.push({ id: clientId, controller });

  // Kirim state awal
  const message = `data: ${JSON.stringify(data.room)}\n\n`;
  const encoder = new TextEncoder();
  try {
    controller.enqueue(encoder.encode(message));
  } catch {
    // ignore
  }
}

export function removeSSEClient(pin: string, clientId: string) {
  const data = rooms.get(pin);
  if (data) {
    data.clients = data.clients.filter((c) => c.id !== clientId);
  }
}

export function updateServerPlayer(pin: string, player: PlayerState): LiveRoom | null {
  const data = rooms.get(pin);
  if (!data) return null;

  data.room.players[player.id] = player;
  broadcastRoomUpdate(pin, data.room);
  return data.room;
}

export function updateServerPlayerProgress(
  pin: string,
  playerId: string,
  progress: number,
  currentWpm: number,
  netWpm: number,
  accuracy: number,
  completed: boolean
): LiveRoom | null {
  const data = rooms.get(pin);
  if (!data) return null;

  if (data.room.players[playerId]) {
    data.room.players[playerId].progress = progress;
    data.room.players[playerId].currentWpm = currentWpm;
    data.room.players[playerId].netWpm = netWpm;
    data.room.players[playerId].accuracy = accuracy;
    data.room.players[playerId].completed = completed;

    if (completed) {
      const roundScore = Math.round(netWpm * 10 * (accuracy / 100));
      data.room.players[playerId].score = (data.room.players[playerId].score || 0) + roundScore;
    }

    broadcastRoomUpdate(pin, data.room);
  }

  return data.room;
}

export function updateServerRoomStatus(pin: string, status: RoomStatus): LiveRoom | null {
  const data = rooms.get(pin);
  if (!data) return null;

  data.room.status = status;
  broadcastRoomUpdate(pin, data.room);
  return data.room;
}

export function advanceServerNextRound(pin: string): LiveRoom | null {
  const data = rooms.get(pin);
  if (!data) return null;

  if (data.room.currentRoundIndex < data.room.rounds.length - 1) {
    data.room.currentRoundIndex += 1;
    data.room.status = 'countdown';
    Object.keys(data.room.players).forEach((id) => {
      data.room.players[id].progress = 0;
      data.room.players[id].completed = false;
      data.room.players[id].currentWpm = 0;
    });
  } else {
    data.room.status = 'podium';
  }

  broadcastRoomUpdate(pin, data.room);
  return data.room;
}
