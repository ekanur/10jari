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

const VALID_AVATARS = new Set([
  'fox', 'cat', 'panda', 'rabbit', 'koala', 'tiger', 'bear', 'lion',
  'monkey', 'owl', 'dog', 'penguin', 'frog', 'unicorn', 'dragon', 'robot',
]);

const MAX_REALISTIC_WPM = 220;

export function updateServerPlayer(pin: string, player: PlayerState): LiveRoom | null {
  const rooms = readAllRooms();
  const room = rooms[pin];

  // Hanya izinkan bergabung ke room yang benar-benar telah dibuat oleh Guru
  if (!room) {
    return null;
  }

  const cleanId = String(player?.id || '').trim().slice(0, 48);
  const cleanName = String(player?.name || 'Siswa')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 30);

  if (!cleanId || !cleanName) {
    return null;
  }

  const cleanAvatar = VALID_AVATARS.has(player?.avatar) ? player.avatar : 'fox';
  const existingPlayer = room.players[cleanId];

  // Cegah manipulasi skor dari paket join (pertahankan skor asli di server atau mulai dari 0)
  room.players[cleanId] = {
    id: cleanId,
    name: cleanName,
    avatar: cleanAvatar,
    progress: existingPlayer ? existingPlayer.progress : 0,
    currentWpm: existingPlayer ? existingPlayer.currentWpm : 0,
    netWpm: existingPlayer ? existingPlayer.netWpm : 0,
    accuracy: existingPlayer ? existingPlayer.accuracy : 100,
    completed: existingPlayer ? existingPlayer.completed : false,
    score: existingPlayer ? existingPlayer.score : 0,
    roundHistory: existingPlayer?.roundHistory || {},
  };

  writeAllRooms(rooms);
  broadcastRoomUpdate(pin, room);
  return room;
}

export function getAllServerRooms(): LiveRoom[] {
  const rooms = readAllRooms();
  return Object.values(rooms).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export function getActiveServerRooms(): LiveRoom[] {
  const rooms = readAllRooms();
  return Object.values(rooms)
    .filter((r) => r.status !== 'podium')
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export function getPastServerRooms(): LiveRoom[] {
  const rooms = readAllRooms();
  return Object.values(rooms)
    .filter((r) => r.status === 'podium')
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export function deleteServerRoom(pin: string): boolean {
  const rooms = readAllRooms();
  if (!rooms[pin]) return false;
  delete rooms[pin];
  writeAllRooms(rooms);

  const clients = clientsMap.get(pin) || [];
  clients.forEach((c) => {
    try {
      c.controller.close();
    } catch {
      // ignore
    }
  });
  clientsMap.delete(pin);
  return true;
}

export function updateServerPlayerProgress(
  pin: string,
  playerId: string,
  progress: number,
  currentWpm: number,
  netWpm: number,
  accuracy: number,
  completed: boolean,
  roundIndex?: number
): LiveRoom | null {
  const rooms = readAllRooms();
  const room = rooms[pin];
  if (!room) return null;

  // Tolak update progres jika ronde sedang tidak berlangsung (in-progress)
  if (room.status !== 'in-progress') {
    return room;
  }

  // Abaikan pembaruan paket yang tertunda jika berasal dari ronde lama
  if (typeof roundIndex === 'number' && roundIndex !== room.currentRoundIndex) {
    return room;
  }

  if (room.players[playerId]) {
    // Anti-Cheat & Sanitasi nilai numerik
    const safeProgress = Math.max(0, Math.min(100, Math.round(Number(progress) || 0)));
    const safeAccuracy = Math.max(0, Math.min(100, Math.round(Number(accuracy) || 0)));
    const safeCurrentWpm = Math.max(0, Math.min(MAX_REALISTIC_WPM, Math.round(Number(currentWpm) || 0)));
    const safeNetWpm = Math.max(
      0,
      Math.min(safeCurrentWpm, Math.round(safeCurrentWpm * (safeAccuracy / 100)), Math.round(Number(netWpm) || 0))
    );
    const safeCompleted = Boolean(completed) && safeProgress >= 100;

    const isFirstCompletion = safeCompleted && !room.players[playerId].completed;

    room.players[playerId].progress = safeProgress;
    room.players[playerId].currentWpm = safeCurrentWpm;
    room.players[playerId].netWpm = safeNetWpm;
    room.players[playerId].accuracy = safeAccuracy;
    room.players[playerId].completed = safeCompleted;

    if (isFirstCompletion) {
      const roundScore = Math.round(safeNetWpm * 10 * (safeAccuracy / 100) * (safeProgress / 100));
      room.players[playerId].score = (room.players[playerId].score || 0) + roundScore;

      const currentRound = room.rounds[room.currentRoundIndex];
      if (!room.players[playerId].roundHistory) {
        room.players[playerId].roundHistory = {};
      }
      room.players[playerId].roundHistory![room.currentRoundIndex] = {
        roundIndex: room.currentRoundIndex,
        roundTitle: currentRound?.title || `Ronde ${room.currentRoundIndex + 1}`,
        category: currentRound?.category,
        netWpm: safeNetWpm,
        currentWpm: safeCurrentWpm,
        accuracy: safeAccuracy,
        progress: safeProgress,
        completed: true,
        scoreEarned: roundScore,
      };
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

  // Jika ronde diakhiri guru, berikan skor proporsional bagi siswa yang belum selesai namun telah mengetik
  if (status === 'round-ended') {
    const currentRound = room.rounds[room.currentRoundIndex];
    Object.keys(room.players).forEach((id) => {
      const player = room.players[id];
      if (!player.roundHistory) {
        player.roundHistory = {};
      }

      if (!player.completed && player.progress > 0) {
        const partialScore = Math.round(
          (player.netWpm || 0) * 10 * ((player.accuracy || 100) / 100) * ((player.progress || 0) / 100)
        );
        player.score = (player.score || 0) + partialScore;
        player.completed = true;

        player.roundHistory[room.currentRoundIndex] = {
          roundIndex: room.currentRoundIndex,
          roundTitle: currentRound?.title || `Ronde ${room.currentRoundIndex + 1}`,
          category: currentRound?.category,
          netWpm: player.netWpm || 0,
          currentWpm: player.currentWpm || 0,
          accuracy: player.accuracy || 100,
          progress: player.progress || 0,
          completed: false,
          scoreEarned: partialScore,
        };
      } else if (player.completed && !player.roundHistory[room.currentRoundIndex]) {
        const roundScore = Math.round(
          (player.netWpm || 0) * 10 * ((player.accuracy || 100) / 100) * ((player.progress || 100) / 100)
        );
        player.roundHistory[room.currentRoundIndex] = {
          roundIndex: room.currentRoundIndex,
          roundTitle: currentRound?.title || `Ronde ${room.currentRoundIndex + 1}`,
          category: currentRound?.category,
          netWpm: player.netWpm || 0,
          currentWpm: player.currentWpm || 0,
          accuracy: player.accuracy || 100,
          progress: player.progress || 100,
          completed: true,
          scoreEarned: roundScore,
        };
      }
    });
  }

  writeAllRooms(rooms);
  broadcastRoomUpdate(pin, room);
  return room;
}

export function advanceServerNextRound(pin: string): LiveRoom | null {
  const rooms = readAllRooms();
  const room = rooms[pin];
  if (!room) return null;

  // Cegah pemanggilan ganda jika status sudah dalam proses hitung mundur (countdown)
  if (room.status === 'countdown') {
    return room;
  }

  if (room.currentRoundIndex < room.rounds.length - 1) {
    const currentRound = room.rounds[room.currentRoundIndex];
    Object.keys(room.players).forEach((id) => {
      const player = room.players[id];
      if (!player.roundHistory) player.roundHistory = {};
      if (!player.roundHistory[room.currentRoundIndex]) {
        player.roundHistory[room.currentRoundIndex] = {
          roundIndex: room.currentRoundIndex,
          roundTitle: currentRound?.title || `Ronde ${room.currentRoundIndex + 1}`,
          category: currentRound?.category,
          netWpm: player.netWpm || 0,
          currentWpm: player.currentWpm || 0,
          accuracy: player.accuracy || 100,
          progress: player.progress || 0,
          completed: player.completed,
          scoreEarned: 0,
        };
      }
      player.progress = 0;
      player.completed = false;
      player.currentWpm = 0;
      player.netWpm = 0;
      player.accuracy = 100;
    });

    room.currentRoundIndex += 1;
    room.status = 'countdown';
  } else {
    room.status = 'podium';
  }

  writeAllRooms(rooms);
  broadcastRoomUpdate(pin, room);
  return room;
}
