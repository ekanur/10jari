'use client';

import React from 'react';
import { PlayerAvatar } from '@/types';

export const AVATAR_MAP: Record<PlayerAvatar, { emoji: string; label: string; color: string }> = {
  fox: { emoji: '🦊', label: 'Rubah Cepat', color: 'bg-orange-500/20 border-orange-500' },
  cat: { emoji: '🐱', label: 'Kucing Lincah', color: 'bg-yellow-500/20 border-yellow-500' },
  panda: { emoji: '🐼', label: 'Panda Tenang', color: 'bg-slate-500/20 border-slate-400' },
  rabbit: { emoji: '🐰', label: 'Kelinci Gesit', color: 'bg-pink-500/20 border-pink-500' },
  bear: { emoji: '🐻', label: 'Beruang Kuat', color: 'bg-amber-700/20 border-amber-600' },
  koala: { emoji: '🐨', label: 'Koala Santai', color: 'bg-teal-500/20 border-teal-500' },
  lion: { emoji: '🦁', label: 'Singa Tangkas', color: 'bg-amber-500/20 border-amber-500' },
  tiger: { emoji: '🐯', label: 'Harimau Cepat', color: 'bg-red-500/20 border-red-500' },
};

interface AvatarPickerProps {
  selected: PlayerAvatar;
  onSelect: (avatar: PlayerAvatar) => void;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({ selected, onSelect }) => {
  return (
    <div className="grid grid-cols-4 gap-2.5 sm:gap-3 py-2">
      {(Object.keys(AVATAR_MAP) as PlayerAvatar[]).map((avatarKey) => {
        const item = AVATAR_MAP[avatarKey];
        const isSelected = selected === avatarKey;

        return (
          <button
            key={avatarKey}
            type="button"
            onClick={() => onSelect(avatarKey)}
            className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 transition-all ${
              isSelected
                ? `${item.color} scale-105 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-400`
                : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-700/60 opacity-80 hover:opacity-100'
            }`}
          >
            <span className="text-3xl sm:text-4xl select-none">{item.emoji}</span>
            <span className="text-[10px] sm:text-xs font-medium text-slate-300 mt-1 truncate max-w-full">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
