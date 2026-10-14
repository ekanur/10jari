'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RoomManager } from '@/lib/realtimeService';
import { LiveRoom } from '@/types';
import { RaceProgressTrack } from '@/components/room/RaceProgressTrack';
import { RoundLeaderboard } from '@/components/room/RoundLeaderboard';
import { FinalPodium } from '@/components/room/FinalPodium';
import { AVATAR_MAP } from '@/components/ui/AvatarPicker';
import { Play, Copy, Check, Users, ArrowRight, Flag, StopCircle } from 'lucide-react';

export default function TeacherHostPage() {
  const params = useParams();
  const router = useRouter();
  const pin = params?.pin as string;

  const [room, setRoom] = useState<LiveRoom | null>(null);
  const [copied, setCopied] = useState(false);
  const [countdownVal, setCountdownVal] = useState(3);
  const managerRef = useRef<RoomManager | null>(null);

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
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
  }, [pin]);

  const copyPin = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Mulai kuis: trigger countdown 3 detik lalu mulai
  const handleStartGame = () => {
    if (!managerRef.current || !room) return;

    managerRef.current.setRoomStatus('countdown');

    // Countdown 3 detik
    setTimeout(() => {
      if (managerRef.current) {
        managerRef.current.setRoomStatus('in-progress');
      }
    }, 3000);
  };

  // Akhiri ronde secara manual
  const handleEndRound = () => {
    if (!managerRef.current) return;
    managerRef.current.setRoomStatus('round-ended');
  };

  // Lanjut ke ronde berikutnya
  const handleNextRound = async () => {
    if (!managerRef.current || !room) return;
    if (isFinalRound) {
      await managerRef.current.setRoomStatus('podium');
    } else {
      await managerRef.current.nextRound();
      // Countdown 3 detik otomatis untuk ronde baru
      setTimeout(() => {
        if (managerRef.current) {
          managerRef.current.setRoomStatus('in-progress');
        }
      }, 3000);
    }
  };

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Menyiapkan Ruang Kelas #{pin}...</p>
        </div>
      </div>
    );
  }

  const playersList = Object.values(room.players);
  const currentRound = room.rounds[room.currentRoundIndex];
  const isFinalRound = room.currentRoundIndex >= room.rounds.length - 1;

  return (
    <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto px-4 py-6 gap-6">
      {/* Top Host Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Layar Host Guru
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            {room.title}
          </h2>
          <p className="text-xs text-slate-400">
            Ronde {room.currentRoundIndex + 1} dari {room.rounds.length} • {currentRound?.title}
          </p>
        </div>

        {/* PIN Box (Sangat jelas untuk proyektor kelas) */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-slate-400">Kode PIN Siswa:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-3xl font-black text-amber-400 tracking-widest bg-slate-950 px-4 py-1.5 rounded-2xl border border-amber-500/40 shadow-inner">
                {room.pin}
              </span>
              <button
                onClick={copyPin}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Salin PIN"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- 1. LOBBY SCREEN (GURU MONITORING JOINING STUDENTS) --- */}
      {room.status === 'lobby' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-900/80 rounded-3xl border border-slate-800 text-center shadow-xl">
          <div className="max-w-xl w-full">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 mb-4 shadow-lg shadow-indigo-500/10">
              <Users className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-white">Menunggu Seluruh Siswa Masuk</h3>
            <p className="text-slate-400 text-sm mt-1">
              Minta siswa membuka aplikasi dan memasukkan PIN <span className="text-amber-400 font-mono font-bold">{room.pin}</span>
            </p>

            {/* List Siswa */}
            <div className="my-8 p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 min-h-[140px] flex flex-wrap items-center justify-center gap-3">
              {playersList.length === 0 ? (
                <span className="text-slate-500 text-xs italic">Belum ada siswa yang masuk...</span>
              ) : (
                playersList.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs font-semibold text-white animate-in zoom-in-75 duration-200"
                  >
                    <span className="text-xl">{AVATAR_MAP[player.avatar]?.emoji || '🐱'}</span>
                    <span>{player.name}</span>
                  </div>
                ))
              )}
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartGame}
              disabled={playersList.length === 0}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-base shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>Mulai Sesi Balapan ({playersList.length} Siswa)</span>
            </button>
          </div>
        </div>
      )}

      {/* --- 2. COUNTDOWN SCREEN --- */}
      {room.status === 'countdown' && (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-amber-400">
            Kuis Dimulai Dalam:
          </span>
          <div className="text-9xl font-black text-amber-400 my-4 animate-bounce">
            {countdownVal}
          </div>
          <h3 className="text-xl font-bold text-white">
            {currentRound?.title}
          </h3>
        </div>
      )}

      {/* --- 3. LIVE SPECTATOR TRACK (GURU MELIHAT BALAPAN LIVE) --- */}
      {room.status === 'in-progress' && (
        <div className="flex-1 flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Flag className="w-5 h-5 text-amber-400" />
                Live Balapan Pengetikan Kelas
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Pantau progres kecepatan dan akurasi setiap siswa secara real-time.
              </p>
            </div>

            <button
              onClick={handleEndRound}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/20"
            >
              <StopCircle className="w-4 h-4" />
              Akhiri Ronde
            </button>
          </div>

          <RaceProgressTrack players={room.players} />
        </div>
      )}

      {/* --- 4. ROUND LEADERBOARD --- */}
      {room.status === 'round-ended' && (
        <div className="flex-1 flex items-center justify-center">
          <RoundLeaderboard
            room={room}
            isHost={true}
            onNextRound={handleNextRound}
          />
        </div>
      )}

      {/* --- 5. FINAL PODIUM --- */}
      {room.status === 'podium' && (
        <div className="flex-1 flex items-center justify-center">
          <FinalPodium room={room} />
        </div>
      )}
    </div>
  );
}
