'use client';

import React from 'react';
import { LiveRoom } from '@/types';
import { AVATAR_MAP } from '@/components/ui/AvatarPicker';
import { Trophy, Award, ArrowRight, FileSpreadsheet } from 'lucide-react';
import { exportRoomSpreadsheet } from '@/lib/exportSpreadsheet';

interface RoundLeaderboardProps {
  room: LiveRoom;
  isHost: boolean;
  onNextRound: () => void;
}

export const RoundLeaderboard: React.FC<RoundLeaderboardProps> = ({
  room,
  isHost,
  onNextRound,
}) => {
  const [isAdvancing, setIsAdvancing] = React.useState(false);

  const handleNextClick = () => {
    if (isAdvancing) return;
    setIsAdvancing(true);
    onNextRound();
  };

  const currentRound = room.rounds[room.currentRoundIndex];
  const isFinalRound = room.currentRoundIndex >= room.rounds.length - 1;
  const nextRound = !isFinalRound ? room.rounds[room.currentRoundIndex + 1] : null;

  // Urutkan siswa berdasarkan total skor tertinggi
  const sortedPlayers = Object.values(room.players).sort((a, b) => (b.score || 0) - (a.score || 0));

  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur animate-in fade-in duration-300">
      <div className="text-center pb-6 border-b border-slate-800">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30">
          Ronde {room.currentRoundIndex + 1} Selesai
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 flex items-center justify-center gap-2">
          <Trophy className="w-8 h-8 text-amber-400" />
          Papan Skor Sementara
        </h2>
        <p className="text-slate-400 text-sm mt-1">{currentRound?.title}</p>
        {currentRound?.category && (
          <span className="inline-block mt-2 text-xs font-semibold text-purple-300 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
            Kategori: {currentRound.category}
          </span>
        )}
      </div>

      {/* Tabel Pemain */}
      <div className="flex flex-col gap-2.5 my-6 max-h-96 overflow-y-auto pr-1">
        {sortedPlayers.map((player, index) => {
          const avatar = AVATAR_MAP[player.avatar] || AVATAR_MAP.panda;
          let rankBadge = `${index + 1}`;
          let rankBg = 'bg-slate-800 text-slate-400';

          if (index === 0) {
            rankBadge = '🥇';
            rankBg = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
          } else if (index === 1) {
            rankBadge = '🥈';
            rankBg = 'bg-slate-400/20 text-slate-300 border border-slate-400/40';
          } else if (index === 2) {
            rankBadge = '🥉';
            rankBg = 'bg-amber-700/20 text-orange-300 border border-amber-700/40';
          }

          return (
            <div
              key={player.id}
              className="flex items-center justify-between p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${rankBg}`}>
                  {rankBadge}
                </div>
                <span className="text-2xl">{avatar.emoji}</span>
                <div>
                  <h4 className="font-bold text-white text-sm">{player.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <span>{player.netWpm} Net WPM</span>
                    <span>•</span>
                    <span className="text-emerald-400">{player.accuracy}% Acc</span>
                    <span>•</span>
                    <span className={player.progress >= 100 ? 'text-emerald-400' : 'text-amber-400'}>
                      {player.progress}% Teks
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium">Total Skor</span>
                <div className="text-xl font-extrabold text-amber-400 font-mono">
                  {player.score || 0}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Teaser Babak Berikutnya (Kategori & Judul Teks) */}
      {!isFinalRound && nextRound && (
        <div className="mb-4 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Persiapan Ronde {nextRound.roundNumber}
              </span>
              {nextRound.category && (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Kategori: {nextRound.category}
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-white">{nextRound.title}</h4>
          </div>
          <span className="text-xs text-indigo-300/80 font-mono hidden sm:inline whitespace-nowrap bg-indigo-900/40 px-2.5 py-1 rounded-lg border border-indigo-500/20">
            {nextRound.text.length} Karakter
          </span>
        </div>
      )}

      {/* Host Controls */}
      <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          Ronde {room.currentRoundIndex + 1} dari {room.rounds.length}
        </div>

        {isHost ? (
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => exportRoomSpreadsheet(room, 'xlsx')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 font-semibold text-xs border border-emerald-500/20 transition-all"
              title="Unduh Rekap Nilai Sementara"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Unduh Rekap</span>
            </button>

            <button
              onClick={handleNextClick}
              disabled={isAdvancing}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
            >
              {isAdvancing ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyiapkan...
                </span>
              ) : (
                <>
                  {isFinalRound ? 'Lihat Podium Juara 🏆' : 'Lanjut ke Ronde Berikutnya'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-xs text-amber-400 animate-pulse font-medium">
            Menunggu guru memulai ronde berikutnya...
          </div>
        )}
      </div>
    </div>
  );
};
