import fs from 'fs';
import path from 'path';
import { LiveRoom, PlayerState, RoomStatus, QuizRound } from '@/types';

interface SSEClient {
  id: string;
  controller: ReadableStreamDefaultController;
}

// Map klien SSE per PIN (in-memory per stream endpoint)
declare global {
  // eslint-disable-next-line no-var
  var __TYPEARENA_SSE_CLIENTS__: Map<string, SSEClient[]> | undefined;
}

const clientsMap = globalThis.__TYPEARENA_SSE_CLIENTS__ || new Map<string, SSEClient[]>();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__TYPEARENA_SSE_CLIENTS__ = clientsMap;
}

const DATA_FILE = path.join(process.cwd(), '.rooms_data.json');

const DEFAULT_FALLBACK_ROUNDS: QuizRound[] = [
  {
    roundNumber: 1,
    title: 'Home Row Dasar (ASDF JKL;)',
    text: 'asdf jkl; asdf jkl; fads jads klas lada jala fasal fajar salak salsa daska',
  },
  {
    roundNumber: 2,
    title: 'Top Row & Angka Dasar',
    text: 'topi roti telur pintu putri pergi kelas 10 nomor 45 tahun 2026',
  },
  {
    roundNumber: 3,
    title: 'Sintaks Kode JavaScript',
    text: 'const filterScores = (scores, min) => scores.filter(s => s >= min);',
    isCode: true,
  },
];

function readAllRooms(): Record<string, LiveRoom> {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return {};
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading rooms data file:', e);
    return {};
  }
}

function writeAllRooms(rooms: Record<string, LiveRoom>) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(rooms, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing rooms data file:', e);
  }
}

export function createServerRoom(title: string, hostName: string, rounds: QuizRound[], customPin?: string): LiveRoom {
  const pin = customPin || Math.floor(100000 + Math.random() * 900000).toString();
  const rooms = readAllRooms();

  // Pastikan rounds tidak pernah kosong
  const validatedRounds = rounds && rounds.length > 0 ? rounds : DEFAULT_FALLBACK_ROUNDS;

  const existing = rooms[pin];
  const room: LiveRoom = {
    pin,
    title: title || 'Ruang Latihan 10 Jari',
    hostName: hostName || 'Guru',
    status: 'lobby',
    currentRoundIndex: 0,
    rounds: validatedRounds,
    players: existing?.players || {},
    countdownSeconds: 3,
    createdAt: Date.now(),
  };

  rooms[pin] = room;
  writeAllRooms(rooms);

  // Broadcast ke klien yang sudah terhubung
  broadcastRoomUpdate(pin, room);

  return room;
}

export function getServerRoom(pin: string): LiveRoom | null {
  const rooms = readAllRooms();
  return rooms[pin] || null;
}

export function broadcastRoomUpdate(pin: string, room: LiveRoom) {
  const clients = clientsMap.get(pin) || [];
  if (clients.length === 0) return;

  const message = `data: ${JSON.stringify(room)}\n\n`;
  const encoder = new TextEncoder();

  const remaining = clients.filter((client) => {
    try {
      client.controller.enqueue(encoder.encode(message));
      return true;
    } catch {
      return false; // Hapus klien yang disconnect
    }
  });

  clientsMap.set(pin, remaining);
}

export function addSSEClient(pin: string, clientId: string, controller: ReadableStreamDefaultController) {
  let clients = clientsMap.get(pin);
  if (!clients) {
    clients = [];
    clientsMap.set(pin, clients);
  }

  clients.push({ id: clientId, controller });

  // Kirim state awal jika room sudah ada di file
  const room = getServerRoom(pin);
  if (room) {
    const message = `data: ${JSON.stringify(room)}\n\n`;
    const encoder = new TextEncoder();
    try {
      controller.enqueue(encoder.encode(message));
    } catch {
      // ignore
    }
  }
}

export function removeSSEClient(pin: string, clientId: string) {
  const clients = clientsMap.get(pin);
  if (clients) {
    clientsMap.set(
      pin,
      clients.filter((c) => c.id !== clientId)
    );
  }
}

export function updateServerPlayer(pin: string, player: PlayerState): LiveRoom | null {
  const rooms = readAllRooms();
  let room = rooms[pin];

  if (!room) {
    // Jika room belum ada, inisialisasi dengan default rounds
    room = createServerRoom('Ruang Latihan', 'Guru', DEFAULT_FALLBACK_ROUNDS, pin);
    rooms[pin] = room;
  }

  room.players[player.id] = player;
  writeAllRooms(rooms);
  broadcastRoomUpdate(pin, room);
  return room;
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
  const rooms = readAllRooms();
  const room = rooms[pin];
  if (!room) return null;

  if (room.players[playerId]) {
    room.players[playerId].progress = progress;
    room.players[playerId].currentWpm = currentWpm;
    room.players[playerId].netWpm = netWpm;
    room.players[playerId].accuracy = accuracy;
    room.players[playerId].completed = completed;

    if (completed) {
      const roundScore = Math.round(netWpm * 10 * (accuracy / 100));
      room.players[playerId].score = (room.players[playerId].score || 0) + roundScore;
    }

    writeAllRooms(rooms);
    broadcastRoomUpdate(pin, room);
  }

  return room;
}

export function updateServerRoomStatus(pin: string, status: RoomStatus): LiveRoom | null {
  const rooms = readAllRooms();
  const room = rooms[pin];
  if (!room) return null;

  room.status = status;
  writeAllRooms(rooms);
  broadcastRoomUpdate(pin, room);
  return room;
}

export function advanceServerNextRound(pin: string): LiveRoom | null {
  const rooms = readAllRooms();
  const room = rooms[pin];
  if (!room) return null;

  if (room.currentRoundIndex < room.rounds.length - 1) {
    room.currentRoundIndex += 1;
    room.status = 'countdown';
    Object.keys(room.players).forEach((id) => {
      room.players[id].progress = 0;
      room.players[id].completed = false;
      room.players[id].currentWpm = 0;
    });
  } else {
    room.status = 'podium';
  }

  writeAllRooms(rooms);
  broadcastRoomUpdate(pin, room);
  return room;
}
