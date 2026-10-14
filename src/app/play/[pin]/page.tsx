'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RoomManager } from '@/lib/realtimeService';
import { LiveRoom, PlayerAvatar, PlayerState } from '@/types';
import { TypingDisplay } from '@/components/typing/TypingDisplay';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import { RaceProgressTrack } from '@/components/room/RaceProgressTrack';
import { RoundLeaderboard } from '@/components/room/RoundLeaderboard';
import { FinalPodium } from '@/components/room/FinalPodium';
import { AVATAR_MAP } from '@/components/ui/AvatarPicker';
import { Users, Clock, Flame, Zap } from 'lucide-react';

export default function PlayRoomPage() {
  const params = useParams();
  const router = useRouter();
  const pin = params?.pin as string;

  const [room, setRoom] = useState<LiveRoom | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [playerAvatar, setPlayerAvatar] = useState<PlayerAvatar>('fox');

  const managerRef = useRef<RoomManager | null>(null);

  // Ambil data identitas player dari sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedId = sessionStorage.getItem('typearena_player_id');
      const storedName = sessionStorage.getItem('typearena_player_name');
      const storedAvatar = (sessionStorage.getItem('typearena_player_avatar') as PlayerAvatar) || 'fox';

      if (!storedId || !storedName) {
        router.push('/join');
        return;
      }

      setPlayerId(storedId);
      setPlayerName(storedName);
      setPlayerAvatar(storedAvatar);

      const manager = new RoomManager(pin);
      managerRef.current = manager;

      const unsubscribe = manager.subscribe((updatedRoom) => {
        setRoom({ ...updatedRoom });
      });

      return () => {
        unsubscribe();
        manager.destroy();
      };
    }
  }, [pin, router]);

  // Target text untuk ronde aktif
  const currentRound = useMemo(() => {
    if (!room || !room.rounds || room.rounds.length === 0) return null;
    return room.rounds[room.currentRoundIndex] || room.rounds[0];
  }, [room]);

  const targetText = currentRound?.text || '';

  const { input, stats, currentIndex, reset } = useTypingEngine({
    targetText,
    enableSound: true,
  });

  // Reset engine ketika ronde berubah
  useEffect(() => {
    if (room?.status === 'countdown' || room?.status === 'in-progress') {
      reset();
    }
  }, [room?.currentRoundIndex, room?.status]);

  // Broadcast progress mengetik secara berkala ke room
  useEffect(() => {
    if (!managerRef.current || !playerId || room?.status !== 'in-progress') return;

    const progressPercentage = targetText.length > 0 ? Math.round((input.length / targetText.length) * 100) : 0;
    const isFinished = input.length >= targetText.length && targetText.length > 0;

    managerRef.current.updatePlayerProgress(
      playerId,
      progressPercentage,
      stats.wpm,
      stats.netWpm,
      stats.accuracy,
      isFinished
    );
  }, [input.length, stats.wpm, stats.netWpm, stats.accuracy, playerId, targetText.length, room?.status]);

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Menghubungkan ke Room #{pin}...</p>
        </div>
      </div>
    );
  }

  // --- 1. TAMPILAN LOBBY MENUNGGU GURU ---
  if (room.status === 'lobby') {
    const playersList = Object.values(room.players);

    return (
      <div className="flex-1 flex flex-col items-center justify-center max-w-3xl w-full mx-auto p-4">
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider mb-3">
            <Users className="w-4 h-4" /> Lobby Room #{room.pin}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
            {room.title}
          </h1>
          <p className="text-slate-400 text-sm mb-8">
            Host: <span className="font-semibold text-slate-200">{room.hostName}</span> • Menunggu guru memulai sesi balapan...
          </p>

          <div className="border-t border-slate-800 pt-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Teman yang Sudah Bergabung ({playersList.length})
            </h3>
            <div className="flex flex-wrap justify-center gap-3 max-h-60 overflow-y-auto">
              {playersList.map((p) => {
                const avatar = AVATAR_MAP[p.avatar] || AVATAR_MAP.fox;
                const isMe = p.id === playerId;

                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs sm:text-sm font-semibold transition-all ${
                      isMe
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 ring-2 ring-indigo-500/40'
                        : 'bg-slate-800/80 border-slate-700 text-slate-200'
                    }`}
                  >
                    <span className="text-xl">{avatar.emoji}</span>
                    <span>{p.name} {isMe && '(Anda)'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. TAMPILAN COUNTDOWN (3, 2, 1) ---
  if (room.status === 'countdown') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center animate-in zoom-in-75 duration-300">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Bersiap di Keyboard!
          </span>
          <div className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-amber-500 to-yellow-600 my-4 animate-pulse">
            3
          </div>
          <h2 className="text-xl font-bold text-white">
            Ronde {room.currentRoundIndex + 1}: {currentRound?.title}
          </h2>
          <p className="text-slate-400 text-xs mt-1">Letakkan jari pada tuts home row (ASDF JKL;)</p>
        </div>
      </div>
    );
  }

  // --- 3. TAMPILAN SESI LIVE BALAPAN MENGETIK (MINIMALIST MONKEYTYPE) ---
  if (room.status === 'in-progress') {
    return (
      <div className="flex-1 flex flex-col items-center max-w-5xl w-full mx-auto px-4 py-6 gap-6">
        {/* Race Track Real-time di bagian atas */}
        <div className="w-full">
          <RaceProgressTrack players={room.players} currentUserId={playerId} />
        </div>

        {/* Live HUD (WPM, Akurasi, Info Ronde) */}
        <div className="flex items-center justify-between w-full px-6 py-2.5 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex items-center gap-6 font-mono text-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-bold text-lg">{stats.netWpm}</span>
              <span className="text-slate-500 text-xs">Net WPM</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold text-lg">{stats.accuracy}%</span>
              <span className="text-slate-500 text-xs">Acc</span>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Ronde {room.currentRoundIndex + 1} dari {room.rounds.length}
          </div>
        </div>

        {/* Minimalist Monkeytype Typing Area (Tanpa keyboard virtual sesuai /grill-me) */}
        <div className="w-full">
          <TypingDisplay
            targetText={targetText}
            input={input}
            currentIndex={currentIndex}
            isCode={currentRound?.isCode}
          />
        </div>

        {input.length >= targetText.length && targetText.length > 0 && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm text-center animate-bounce">
            🎉 Hebat! Anda telah menyelesaikan teks ronde ini. Menunggu seluruh peserta selesai...
          </div>
        )}
      </div>
    );
  }

  // --- 4. TAMPILAN SKOR SEMENTARA AKHIR RONDE ---
  if (room.status === 'round-ended') {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <RoundLeaderboard
          room={room}
          isHost={false}
          onNextRound={() => {}}
        />
      </div>
    );
  }

  // --- 5. TAMPILAN PODIUM AKHIR ---
  if (room.status === 'podium') {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <FinalPodium room={room} />
      </div>
    );
  }

  return null;
}
