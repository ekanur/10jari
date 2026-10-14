'use client';

import React from 'react';
import { PlayerState } from '@/types';
import { AVATAR_MAP } from '@/components/ui/AvatarPicker';
import { CheckCircle2, Flag } from 'lucide-react';

interface RaceProgressTrackProps {
  players: Record<string, PlayerState>;
  currentUserId?: string;
}

export const RaceProgressTrack: React.FC<RaceProgressTrackProps> = ({
  players,
  currentUserId,
}) => {
  const playerList = Object.values(players);

  if (playerList.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 italic">
        Menunggu siswa bergabung ke arena balapan...
      </div>
    );
  }

  // Urutkan berdasarkan progress dan netWpm tertinggi
  const sortedPlayers = [...playerList].sort((a, b) => {
    if (b.progress !== a.progress) return b.progress - a.progress;
    return b.netWpm - a.netWpm;
  });

  return (
    <div className="flex flex-col gap-3 w-full max-w-4xl mx-auto p-4 md:p-6 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-400 font-medium">
        <span>Peserta Balapan ({playerList.length})</span>
        <span className="flex items-center gap-1.5 text-amber-400">
          <Flag className="w-3.5 h-3.5" /> Garis Finish
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {sortedPlayers.map((player, idx) => {
          const isCurrentUser = player.id === currentUserId;
          const avatarData = AVATAR_MAP[player.avatar] || AVATAR_MAP.panda;

          return (
            <div
              key={player.id}
              className={`relative flex flex-col p-3 rounded-xl border transition-all ${
                isCurrentUser
                  ? 'bg-indigo-950/40 border-indigo-500/60 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-800/60 border-slate-700/50'
              }`}
            >
              {/* Header Info */}
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400">#{idx + 1}</span>
                  <span className="text-base">{avatarData.emoji}</span>
                  <span className={`font-semibold ${isCurrentUser ? 'text-indigo-300' : 'text-slate-200'}`}>
                    {player.name} {isCurrentUser && '(Anda)'}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-amber-400 font-bold">{player.netWpm} WPM</span>
                  <span className="text-emerald-400 text-[11px]">{player.accuracy}% Acc</span>
                  {player.completed && (
                    <span className="flex items-center gap-1 text-emerald-400 font-sans text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                    </span>
                  )}
                </div>
              </div>

              {/* Race Track Bar */}
              <div className="relative w-full h-4 bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-300 ease-out ${
                    player.completed
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : isCurrentUser
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(2, player.progress))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
