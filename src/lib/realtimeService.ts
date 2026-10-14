'use client';

import { LiveRoom, PlayerState, RoomStatus, QuizRound } from '@/types';

type MessageType =
  | 'ROOM_UPDATE'
  | 'PLAYER_JOIN'
  | 'PLAYER_LEAVE'
  | 'START_COUNTDOWN'
  | 'START_ROUND'
  | 'UPDATE_PROGRESS'
  | 'END_ROUND'
  | 'NEXT_ROUND'
  | 'SHOW_PODIUM';

interface RealtimeMessage {
  type: MessageType;
  pin: string;
  payload: any;
}

const ROOM_STORAGE_PREFIX = 'typearena_room_';

export class RoomManager {
  private pin: string;
  private channel: BroadcastChannel | null = null;
  private listeners: ((room: LiveRoom) => void)[] = [];

  constructor(pin: string) {
    this.pin = pin;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(`typearena_room_${pin}`);
      this.channel.onmessage = (event: MessageEvent<RealtimeMessage>) => {
        this.handleMessage(event.data);
      };

      // Also listen to storage events for cross-tab fallback
      window.addEventListener('storage', (e) => {
        if (e.key === `${ROOM_STORAGE_PREFIX}${pin}` && e.newValue) {
          try {
            const updated = JSON.parse(e.newValue);
            this.notify(updated);
          } catch {
            // ignore
          }
        }
      });
    }
  }

  public getRoom(): LiveRoom | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`${ROOM_STORAGE_PREFIX}${this.pin}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public saveRoom(room: LiveRoom): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${ROOM_STORAGE_PREFIX}${this.pin}`, JSON.stringify(room));
    this.broadcast({
      type: 'ROOM_UPDATE',
      pin: this.pin,
      payload: room,
    });
    this.notify(room);
  }

  private broadcast(msg: RealtimeMessage) {
    if (this.channel) {
      this.channel.postMessage(msg);
    }
  }

  private handleMessage(msg: RealtimeMessage) {
    if (msg.pin !== this.pin) return;

    const currentRoom = this.getRoom();
    if (!currentRoom) return;

    switch (msg.type) {
      case 'ROOM_UPDATE':
        this.notify(msg.payload);
        break;

      case 'PLAYER_JOIN': {
        const player: PlayerState = msg.payload;
        currentRoom.players[player.id] = player;
        this.saveRoom(currentRoom);
        break;
      }

      case 'UPDATE_PROGRESS': {
        const { playerId, progress, currentWpm, netWpm, accuracy, completed } = msg.payload;
        if (currentRoom.players[playerId]) {
          currentRoom.players[playerId].progress = progress;
          currentRoom.players[playerId].currentWpm = currentWpm;
          currentRoom.players[playerId].netWpm = netWpm;
          currentRoom.players[playerId].accuracy = accuracy;
          currentRoom.players[playerId].completed = completed;
          
          // Akumulasi skor (WPM * 10 * (Akurasi/100))
          if (completed) {
            const roundScore = Math.round(netWpm * 10 * (accuracy / 100));
            currentRoom.players[playerId].score = (currentRoom.players[playerId].score || 0) + roundScore;
          }

          this.saveRoom(currentRoom);
        }
        break;
      }

      case 'START_COUNTDOWN':
      case 'START_ROUND':
      case 'END_ROUND':
      case 'NEXT_ROUND':
      case 'SHOW_PODIUM':
        this.notify(msg.payload);
        break;
    }
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

  public joinPlayer(player: PlayerState): void {
    const room = this.getRoom();
    if (!room) return;
    room.players[player.id] = player;
    this.saveRoom(room);
    this.broadcast({
      type: 'PLAYER_JOIN',
      pin: this.pin,
      payload: player,
    });
  }

  public updatePlayerProgress(
    playerId: string,
    progress: number,
    currentWpm: number,
    netWpm: number,
    accuracy: number,
    completed: boolean
  ): void {
    this.broadcast({
      type: 'UPDATE_PROGRESS',
      pin: this.pin,
      payload: { playerId, progress, currentWpm, netWpm, accuracy, completed },
    });
    // Juga update local storage jika dijalankan dari tab yang sama
    const room = this.getRoom();
    if (room && room.players[playerId]) {
      room.players[playerId].progress = progress;
      room.players[playerId].currentWpm = currentWpm;
      room.players[playerId].netWpm = netWpm;
      room.players[playerId].accuracy = accuracy;
      room.players[playerId].completed = completed;
      if (completed) {
        const roundScore = Math.round(netWpm * 10 * (accuracy / 100));
        room.players[playerId].score = (room.players[playerId].score || 0) + roundScore;
      }
      this.saveRoom(room);
    }
  }

  public setRoomStatus(status: RoomStatus): void {
    const room = this.getRoom();
    if (!room) return;
    room.status = status;
    this.saveRoom(room);
  }

  public nextRound(): void {
    const room = this.getRoom();
    if (!room) return;
    if (room.currentRoundIndex < room.rounds.length - 1) {
      room.currentRoundIndex += 1;
      room.status = 'countdown';
      // Reset progress player untuk ronde baru
      Object.keys(room.players).forEach((id) => {
        room.players[id].progress = 0;
        room.players[id].completed = false;
        room.players[id].currentWpm = 0;
      });
      this.saveRoom(room);
    } else {
      // Jika ronde habis, tampilkan podium
      room.status = 'podium';
      this.saveRoom(room);
    }
  }

  public destroy(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners = [];
  }
}

// Helper untuk membuat room baru oleh Guru
export function createLiveRoom(title: string, hostName: string, rounds: QuizRound[]): LiveRoom {
  // Generate PIN 6 angka acak
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
  }

  return room;
}
