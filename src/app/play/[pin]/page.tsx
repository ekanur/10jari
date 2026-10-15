'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RoomManager } from '@/lib/realtimeService';
import { LiveRoom, PlayerAvatar } from '@/types';
import { TypingDisplay } from '@/components/typing/TypingDisplay';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import { RoundLeaderboard } from '@/components/room/RoundLeaderboard';
import { FinalPodium } from '@/components/room/FinalPodium';
import { AVATAR_MAP } from '@/components/ui/AvatarPicker';
import { Users, Flame, Zap, Trophy } from 'lucide-react';

interface StudentRaceScreenProps {
  room: LiveRoom;
  roundIndex: number;
  playerId: string;
  manager: RoomManager;
}

// Sub-komponen pengetikan siswa dengan isolasi state per ronde
function StudentRaceScreen({ room, roundIndex, playerId, manager }: StudentRaceScreenProps) {
  const currentRound = room.rounds[roundIndex] || room.rounds[0];
  const targetText = currentRound?.text || '';

  const { input, stats, currentIndex } = useTypingEngine({
    targetText,
    enableSound: true,
  });

  // Hitung peringkat live siswa terhadap seluruh peserta dalam room
  const playerList = Object.values(room.players);
  const totalPlayers = playerList.length;

  const sortedPlayers = useMemo(() => {
    return [...playerList].sort((a, b) => {
      if (a.completed && !b.completed) return -1;
      if (!a.completed && b.completed) return 1;
      if (b.progress !== a.progress) return b.progress - a.progress;
      return (b.netWpm || 0) - (a.netWpm || 0);
    });
  }, [playerList]);

  const myRankIndex = sortedPlayers.findIndex((p) => p.id === playerId);
  const myRank = myRankIndex !== -1 ? myRankIndex + 1 : 1;

  const progressPercentage =
    targetText.length > 0 ? Math.min(100, Math.round((input.length / targetText.length) * 100)) : 0;
  const isFinished = input.length >= targetText.length && targetText.length > 0;

  // Broadcast progress mengetik siswa secara berkala ke server
  useEffect(() => {
    if (!manager || !playerId || room.status !== 'in-progress') return;

    manager.updatePlayerProgress(
      playerId,
      progressPercentage,
      stats.wpm,
      stats.netWpm,
      stats.accuracy,
      isFinished,
      roundIndex
    );
  }, [manager, playerId, progressPercentage, stats.wpm, stats.netWpm, stats.accuracy, isFinished, roundIndex, room.status]);

  // Styling badge ranking
  let rankColor = 'bg-slate-800 text-slate-300 border-slate-700';
  let rankLabel = `Peringkat #${myRank}`;
  if (myRank === 1) {
    rankColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10';
    rankLabel = `🥇 Juara 1`;
  } else if (myRank === 2) {
    rankColor = 'bg-slate-300/20 text-slate-200 border-slate-300/40';
    rankLabel = `🥈 Juara 2`;
  } else if (myRank === 3) {
    rankColor = 'bg-amber-700/20 text-orange-300 border-amber-700/40';
    rankLabel = `🥉 Juara 3`;
  }

  return (
    <div className="flex-1 flex flex-col items-center max-w-5xl w-full mx-auto px-4 py-6 gap-6">
      {/* HUD Bersih Sisi Siswa: Peringkat, WPM, Akurasi, Info Ronde */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Peringkat Siswa dari Total Peserta */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-black text-sm sm:text-base shadow-sm ${rankColor}`}>
            <Trophy className="w-4 h-4" />
            <span>{rankLabel}</span>
            <span className="text-xs font-normal opacity-80">dari {totalPlayers} Siswa</span>
          </div>
        </div>

        {/* Kecepatan & Akurasi */}
        <div className="flex items-center gap-6 font-mono">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-bold text-xl">{stats.netWpm}</span>
            <span className="text-slate-500 text-xs uppercase tracking-wider font-sans">Net WPM</span>
          </div>

          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 font-bold text-xl">{stats.accuracy}%</span>
            <span className="text-slate-500 text-xs uppercase tracking-wider font-sans">Akurasi</span>
          </div>
        </div>

        {/* Info Ronde & Kategori */}
        <div className="flex items-center gap-2">
          {currentRound?.category && (
            <span className="hidden sm:inline-flex text-xs text-purple-300 font-semibold bg-purple-500/10 px-3 py-1 rounded-xl border border-purple-500/20">
              Kategori: {currentRound.category}
            </span>
          )}
          <div className="text-xs text-slate-400 font-medium bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700">
            Ronde {roundIndex + 1} dari {room.rounds.length}
          </div>
        </div>
      </div>

      {/* Baris Progres Personal Siswa Sendiri (Bukan Leaderboard Lawan) */}
      <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 px-4 shadow-sm flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>Progres Pengetikan Anda</span>
          <span className="font-mono text-purple-400">{progressPercentage}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-emerald-400 rounded-full transition-all duration-200"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Area Mengetik Monkeytype */}
      <div className="w-full">
        <TypingDisplay
          targetText={targetText}
          input={input}
          currentIndex={currentIndex}
          isCode={currentRound?.isCode}
        />
      </div>

      {isFinished && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm text-center animate-bounce shadow-lg shadow-emerald-500/10">
          🎉 Hebat! Anda telah menyelesaikan teks ronde ini. Menunggu seluruh peserta selesai dan guru membuka papan skor...
        </div>
      )}
    </div>
  );
}

export default function PlayRoomPage() {
  const params = useParams();
  const router = useRouter();
  const pin = params?.pin as string;

  const [room, setRoom] = useState<LiveRoom | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [playerAvatar, setPlayerAvatar] = useState<PlayerAvatar>('fox');
  const [countdownVal, setCountdownVal] = useState<number>(3);

  const managerRef = useRef<RoomManager | null>(null);

  // Countdown ticker lokal (3, 2, 1) - wajib ditaruh di level teratas sebelum return kondisional
  useEffect(() => {
    if (room?.status === 'countdown') {
      setCountdownVal(3);
      const t1 = setTimeout(() => setCountdownVal(2), 1000);
      const t2 = setTimeout(() => setCountdownVal(1), 2000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [room?.status, room?.currentRoundIndex]);

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
          <p className="text-slate-400 text-sm mb-6">
            Host: <span className="font-semibold text-slate-200">{room.hostName}</span> • Menunggu guru memulai sesi balapan...
          </p>

          {/* Info Kategori Babak 1 yang Akan Dikerjakan */}
          {room.rounds && room.rounds[0] && (
            <div className="mb-6 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Materi Babak 1
                  </span>
                  {room.rounds[0].category && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Kategori: {room.rounds[0].category}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white">{room.rounds[0].title}</h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Total {room.rounds.length} Babak turnamen • Siapkan posisi jari Anda pada tuts Home Row (ASDF JKL;)
                </p>
              </div>
              <span className="text-xs text-indigo-300 font-mono bg-indigo-900/50 px-3 py-1 rounded-xl border border-indigo-500/30 whitespace-nowrap">
                {room.rounds[0].text.length} Karakter
              </span>
            </div>
          )}

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

  const currentRound = room.rounds[room.currentRoundIndex] || room.rounds[0];

  // --- 2. TAMPILAN COUNTDOWN (3, 2, 1) ---
  if (room.status === 'countdown') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center animate-in zoom-in-75 duration-300">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Bersiap di Keyboard!
          </span>
          <div className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-amber-500 to-yellow-600 my-4 animate-bounce">
            {countdownVal}
          </div>
          {currentRound?.category && (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold mb-2 shadow-sm">
              <span>Kategori:</span>
              <span className="text-white">{currentRound.category}</span>
            </div>
          )}
          <h2 className="text-xl font-bold text-white">
            Ronde {room.currentRoundIndex + 1}: {currentRound?.title}
          </h2>
          <p className="text-slate-400 text-xs mt-1">Letakkan jari pada tuts home row (ASDF JKL;)</p>
        </div>
      </div>
    );
  }

  // --- 3. TAMPILAN SESI LIVE BALAPAN MENGETIK (STATE TERISOLASI PER RONDE) ---
  if (room.status === 'in-progress' && managerRef.current) {
    return (
      <StudentRaceScreen
        key={`${room.pin}-${room.currentRoundIndex}`}
        room={room}
        roundIndex={room.currentRoundIndex}
        playerId={playerId}
        manager={managerRef.current}
      />
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
