'use client';

import React, { useEffect } from 'react';
import { LiveRoom } from '@/types';
import { AVATAR_MAP } from '@/components/ui/AvatarPicker';
import { Trophy, Home, Sparkles, FileSpreadsheet, Download } from 'lucide-react';
import { exportRoomSpreadsheet } from '@/lib/exportSpreadsheet';
import Link from 'next/link';

interface FinalPodiumProps {
  room: LiveRoom;
  onExit?: () => void;
}

export const FinalPodium: React.FC<FinalPodiumProps> = ({ room }) => {
  // Fire confetti
  useEffect(() => {
    try {
      import('canvas-confetti').then((confettiModule) => {
        const confetti = confettiModule.default;
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });

        // Second wave
        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 600);
      });
    } catch {
      // ignore
    }
  }, []);

  const sortedPlayers = Object.values(room.players).sort((a, b) => (b.score || 0) - (a.score || 0));
  const first = sortedPlayers[0];
  const second = sortedPlayers[1];
  const third = sortedPlayers[2];
  const others = sortedPlayers.slice(3);

  return (
    <div className="w-full max-w-3xl mx-auto p-6 md:p-10 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur animate-in zoom-in-95 duration-500">
      <div className="text-center pb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-sm border border-amber-500/30 mb-3">
          <Sparkles className="w-4 h-4" /> Kuis Selesai!
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          PODIUM JUARA 🏆
        </h1>
        <p className="text-slate-400 mt-2 text-sm sm:text-base">
          Selamat kepada para pengetik 10 jari tercepat di kelas!
        </p>
      </div>

      {/* Podium Display (2nd - 1st - 3rd) */}
      <div className="flex items-end justify-center gap-3 sm:gap-6 my-8 pt-6">
        {/* Juara 2 (Perak) */}
        {second && (
          <div className="flex flex-col items-center flex-1 max-w-[160px]">
            <span className="text-4xl sm:text-5xl mb-2 animate-bounce">
              {AVATAR_MAP[second.avatar]?.emoji || '🐱'}
            </span>
            <div className="text-xs sm:text-sm font-bold text-white truncate max-w-full text-center">
              {second.name}
            </div>
            <div className="text-xs font-mono text-slate-300 font-bold">{second.score || 0} Pts</div>
            <div className="w-full h-32 sm:h-36 bg-gradient-to-t from-slate-700 to-slate-500 rounded-t-2xl flex flex-col items-center justify-center border-t-2 border-slate-300 shadow-lg mt-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-white">2</span>
              <span className="text-[10px] uppercase font-bold text-slate-200">Perak</span>
            </div>
          </div>
        )}

        {/* Juara 1 (Emas - Tertinggi) */}
        {first && (
          <div className="flex flex-col items-center flex-1 max-w-[180px]">
            <div className="relative">
              <span className="text-5xl sm:text-6xl mb-2 block animate-bounce">
                {AVATAR_MAP[first.avatar]?.emoji || '🦊'}
              </span>
              <span className="absolute -top-4 -right-2 text-2xl">👑</span>
            </div>
            <div className="text-sm sm:text-base font-extrabold text-amber-300 truncate max-w-full text-center">
              {first.name}
            </div>
            <div className="text-xs sm:text-sm font-mono text-amber-400 font-bold">
              {first.score || 0} Pts
            </div>
            <div className="w-full h-44 sm:h-52 bg-gradient-to-t from-amber-600 to-yellow-400 rounded-t-2xl flex flex-col items-center justify-center border-t-4 border-yellow-200 shadow-2xl shadow-yellow-500/20 mt-2">
              <Trophy className="w-8 h-8 text-slate-900 mb-1" />
              <span className="text-4xl sm:text-5xl font-black text-slate-950">1</span>
              <span className="text-xs uppercase font-extrabold text-slate-900">Juara 1</span>
            </div>
          </div>
        )}

        {/* Juara 3 (Perunggu) */}
        {third && (
          <div className="flex flex-col items-center flex-1 max-w-[160px]">
            <span className="text-4xl sm:text-5xl mb-2 animate-bounce">
              {AVATAR_MAP[third.avatar]?.emoji || '🐼'}
            </span>
            <div className="text-xs sm:text-sm font-bold text-white truncate max-w-full text-center">
              {third.name}
            </div>
            <div className="text-xs font-mono text-slate-300 font-bold">{third.score || 0} Pts</div>
            <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-amber-900 to-amber-700 rounded-t-2xl flex flex-col items-center justify-center border-t-2 border-amber-500 shadow-lg mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">3</span>
              <span className="text-[10px] uppercase font-bold text-amber-200">Perunggu</span>
            </div>
          </div>
        )}
      </div>

      {/* Tabel Peserta Lainnya */}
      {others.length > 0 && (
        <div className="mt-8 border-t border-slate-800 pt-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Peringkat Peserta Lainnya
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {others.map((player, idx) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400">#{idx + 4}</span>
                  <span>{AVATAR_MAP[player.avatar]?.emoji}</span>
                  <span className="font-medium text-white">{player.name}</span>
                </div>
                <div className="font-mono text-amber-400 font-bold">{player.score || 0} Pts</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Navigation & Download Rekap Guru */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
        <button
          onClick={() => exportRoomSpreadsheet(room, 'xlsx')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Unduh Rekap Nilai (.xlsx)</span>
        </button>

        <button
          onClick={() => exportRoomSpreadsheet(room, 'csv')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all border border-slate-700"
          title="Unduh format CSV"
        >
          <Download className="w-4 h-4" />
          <span>Unduh CSV</span>
        </button>

        <Link
          href="/"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all border border-slate-700 shadow-md"
        >
          <Home className="w-4 h-4" /> Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};
