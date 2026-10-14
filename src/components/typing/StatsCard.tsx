'use client';

import React from 'react';
import { TypingStats } from '@/types';
import { RotateCcw, Trophy, Zap, Target, Clock, AlertTriangle } from 'lucide-react';

interface StatsCardProps {
  stats: TypingStats;
  onRestart: () => void;
  onNext?: () => void;
  title?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  stats,
  onRestart,
  onNext,
  title = 'Latihan Selesai!',
}) => {
  return (
    <div className="w-full max-w-xl mx-auto p-6 md:p-8 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-400" />
            {title}
          </h2>
          <p className="text-slate-400 text-sm mt-1">Performa Mengetik 10 Jari</p>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Kecepatan Bersih</span>
          <div className="text-4xl font-extrabold text-amber-400 font-mono">
            {stats.netWpm} <span className="text-sm font-sans font-normal text-slate-400">WPM</span>
          </div>
        </div>
      </div>

      {/* Grid Statistik */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
        <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            Akurasi
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{stats.accuracy}%</div>
        </div>

        <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            Raw WPM
          </div>
          <div className="text-2xl font-bold text-indigo-400 font-mono">{stats.wpm}</div>
        </div>

        <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Durasi
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">{stats.elapsedSeconds}s</div>
        </div>

        <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Kesalahan
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">{stats.incorrectChars}</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-all border border-slate-700 shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Ulangi Latihan
        </button>

        {onNext && (
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30"
          >
            Lanjut Soal Berikutnya →
          </button>
        )}
      </div>
    </div>
  );
};
