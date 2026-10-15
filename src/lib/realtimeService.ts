'use client';

import { LiveRoom, PlayerState, RoomStatus, QuizRound } from '@/types';

const ROOM_STORAGE_PREFIX = 'typearena_room_';

export class RoomManager {
  private pin: string;
  private channel: BroadcastChannel | null = null;
  private eventSource: EventSource | null = null;
  private pollInterval: NodeJS.Timeout | null = null;
  private listeners: ((room: LiveRoom) => void)[] = [];
  private currentRoom: LiveRoom | null = null;

  constructor(pin: string) {
    this.pin = pin;

    // 1. Muat data awal dari localStorage (jika ada)
    this.currentRoom = this.getLocalRoom();

    if (typeof window !== 'undefined') {
      // 2. BroadcastChannel untuk sinkronisasi tab lokal super cepat
      if ('BroadcastChannel' in window) {
        this.channel = new BroadcastChannel(`typearena_room_${pin}`);
        this.channel.onmessage = (event) => {
          if (event.data?.type === 'ROOM_UPDATE') {
            this.updateLocalRoom(event.data.payload);
          }
        };
      }

      // 3. Server-Sent Events (SSE) untuk sinkronisasi antar browser & perangkat
      this.initSSE();

      // 4. Polling fallback jika SSE tidak didukung / terputus
      this.pollInterval = setInterval(() => {
        this.fetchServerRoom();
      }, 1500);

      // Ambil data pertama dari server segera
      this.fetchServerRoom();
    }
  }

  private initSSE() {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

    try {
      this.eventSource = new EventSource(`/api/rooms/${this.pin}/stream`);
      this.eventSource.onmessage = (e) => {
        try {
          const room: LiveRoom = JSON.parse(e.data);
          this.updateLocalRoom(room);
        } catch {
          // ignore
        }
      };

      this.eventSource.onerror = () => {
        // SSE error, polling akan menjadi fallback otomatis
      };
    } catch {
      // ignore
    }
  }

  public async fetchServerRoom(): Promise<LiveRoom | null> {
    try {
      const res = await fetch(`/api/rooms/${this.pin}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.success && data.room) {
        this.updateLocalRoom(data.room);
        return data.room;
      }
    } catch {
      // offline / network error
    }
    return null;
  }

  private getLocalRoom(): LiveRoom | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`${ROOM_STORAGE_PREFIX}${this.pin}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public getRoom(): LiveRoom | null {
    return this.currentRoom || this.getLocalRoom();
  }

  private updateLocalRoom(room: LiveRoom) {
    this.currentRoom = room;
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${ROOM_STORAGE_PREFIX}${this.pin}`, JSON.stringify(room));
    }
    this.notify(room);
  }

  public subscribe(cb: (room: LiveRoom) => void): () => void {
    this.listeners.push(cb);
    const room = this.getRoom();
    if (room) cb(room);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify(room: LiveRoom) {
    this.listeners.forEach((l) => l(room));
  }

  public async joinPlayer(player: PlayerState): Promise<void> {
    // 1. Optimistic local update
    const room = this.getRoom();
    if (room) {
      room.players[player.id] = player;
      this.updateLocalRoom(room);
    }

    // 2. Kirim ke server agar browser lain juga menerima
    try {
      await fetch(`/api/rooms/${this.pin}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', player }),
      });
    } catch {
      // ignore
    }

    // 3. Broadcast lokal
    if (this.channel && room) {
      this.channel.postMessage({ type: 'ROOM_UPDATE', payload: room });
    }
  }

  public async updatePlayerProgress(
    playerId: string,
    progress: number,
    currentWpm: number,
    netWpm: number,
    accuracy: number,
    completed: boolean,
    roundIndex?: number
  ): Promise<void> {
    // 1. Optimistic local update
    const room = this.getRoom();
    if (room && room.players[playerId]) {
      const isFirstCompletion = completed && !room.players[playerId].completed;

      room.players[playerId].progress = progress;
      room.players[playerId].currentWpm = currentWpm;
      room.players[playerId].netWpm = netWpm;
      room.players[playerId].accuracy = accuracy;
      room.players[playerId].completed = completed;

      if (isFirstCompletion) {
        const roundScore = Math.round(netWpm * 10 * (accuracy / 100) * (progress / 100));
        room.players[playerId].score = (room.players[playerId].score || 0) + roundScore;

        const currentRound = room.rounds[room.currentRoundIndex];
        if (!room.players[playerId].roundHistory) {
          room.players[playerId].roundHistory = {};
        }
        room.players[playerId].roundHistory![room.currentRoundIndex] = {
          roundIndex: room.currentRoundIndex,
          roundTitle: currentRound?.title || `Ronde ${room.currentRoundIndex + 1}`,
          category: currentRound?.category,
          netWpm,
          currentWpm,
          accuracy,
          progress,
          completed: true,
          scoreEarned: roundScore,
        };
      }
      this.updateLocalRoom(room);
    }

    // 2. Kirim ke server
    try {
      await fetch(`/api/rooms/${this.pin}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, progress, currentWpm, netWpm, accuracy, completed, roundIndex }),
      });
    } catch {
      // ignore
    }
  }

  public async setRoomStatus(status: RoomStatus): Promise<void> {
    const room = this.getRoom();
    if (room) {
      room.status = status;
      this.updateLocalRoom(room);
    }

    try {
      await fetch(`/api/rooms/${this.pin}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status', status }),
      });
    } catch {
      // ignore
    }
  }

  public async nextRound(): Promise<void> {
    try {
      const res = await fetch(`/api/rooms/${this.pin}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'next-round' }),
      });
      const data = await res.json();
      if (data.success && data.room) {
        this.updateLocalRoom(data.room);
      }
    } catch {
      // Fallback lokal
      const room = this.getRoom();
      if (room) {
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
        this.updateLocalRoom(room);
      }
    }
  }

  public destroy(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.listeners = [];
  }
}

// Helper untuk membuat room baru oleh Guru
export async function createLiveRoom(title: string, hostName: string, rounds: QuizRound[]): Promise<LiveRoom> {
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
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

  if (typeof window !== 'undefined') {
    localStorage.setItem(`${ROOM_STORAGE_PREFIX}${pin}`, JSON.stringify(room));

    // Daftarkan room ke server agar dapat diakses dari BEDA BROWSER dan BEDA PERANGKAT
    try {
      await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, hostName, rounds, pin }),
      });
    } catch {
      // ignore
    }
  }

  return room;
}
