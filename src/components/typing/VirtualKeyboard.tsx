'use client';

import React from 'react';
import { KeyHandFinger } from '@/types';

interface VirtualKeyboardProps {
  currentChar: string;
}

interface KeyConfig {
  key: string;
  display: string;
  finger: KeyHandFinger;
  width?: string;
}

const KEYBOARD_ROWS: KeyConfig[][] = [
  // Row 0
  [
    { key: '`', display: '`', finger: 'left-pinky' },
    { key: '1', display: '1', finger: 'left-pinky' },
    { key: '2', display: '2', finger: 'left-ring' },
    { key: '3', display: '3', finger: 'left-middle' },
    { key: '4', display: '4', finger: 'left-index' },
    { key: '5', display: '5', finger: 'left-index' },
    { key: '6', display: '6', finger: 'right-index' },
    { key: '7', display: '7', finger: 'right-index' },
    { key: '8', display: '8', finger: 'right-middle' },
    { key: '9', display: '9', finger: 'right-ring' },
    { key: '0', display: '0', finger: 'right-pinky' },
    { key: '-', display: '-', finger: 'right-pinky' },
    { key: '=', display: '=', finger: 'right-pinky' },
    { key: 'Backspace', display: 'Bksp', finger: 'right-pinky', width: 'w-14' },
  ],
  // Row 1
  [
    { key: 'Tab', display: 'Tab', finger: 'left-pinky', width: 'w-12' },
    { key: 'q', display: 'Q', finger: 'left-pinky' },
    { key: 'w', display: 'W', finger: 'left-ring' },
    { key: 'e', display: 'E', finger: 'left-middle' },
    { key: 'r', display: 'R', finger: 'left-index' },
    { key: 't', display: 'T', finger: 'left-index' },
    { key: 'y', display: 'Y', finger: 'right-index' },
    { key: 'u', display: 'U', finger: 'right-index' },
    { key: 'i', display: 'I', finger: 'right-middle' },
    { key: 'o', display: 'O', finger: 'right-ring' },
    { key: 'p', display: 'P', finger: 'right-pinky' },
    { key: '[', display: '[', finger: 'right-pinky' },
    { key: ']', display: ']', finger: 'right-pinky' },
    { key: '\\', display: '\\', finger: 'right-pinky' },
  ],
  // Row 2 (Home Row)
  [
    { key: 'CapsLock', display: 'Caps', finger: 'left-pinky', width: 'w-14' },
    { key: 'a', display: 'A', finger: 'left-pinky' },
    { key: 's', display: 'S', finger: 'left-ring' },
    { key: 'd', display: 'D', finger: 'left-middle' },
    { key: 'f', display: 'F', finger: 'left-index' }, // Home bar marker
    { key: 'g', display: 'G', finger: 'left-index' },
    { key: 'h', display: 'H', finger: 'right-index' },
    { key: 'j', display: 'J', finger: 'right-index' }, // Home bar marker
    { key: 'k', display: 'K', finger: 'right-middle' },
    { key: 'l', display: 'L', finger: 'right-ring' },
    { key: ';', display: ';', finger: 'right-pinky' },
    { key: "'", display: "'", finger: 'right-pinky' },
    { key: 'Enter', display: 'Enter', finger: 'right-pinky', width: 'w-16' },
  ],
  // Row 3
  [
    { key: 'Shift', display: 'Shift', finger: 'left-pinky', width: 'w-16' },
    { key: 'z', display: 'Z', finger: 'left-pinky' },
    { key: 'x', display: 'X', finger: 'left-ring' },
    { key: 'c', display: 'C', finger: 'left-middle' },
    { key: 'v', display: 'V', finger: 'left-index' },
    { key: 'b', display: 'B', finger: 'left-index' },
    { key: 'n', display: 'N', finger: 'right-index' },
    { key: 'm', display: 'M', finger: 'right-index' },
    { key: ',', display: ',', finger: 'right-middle' },
    { key: '.', display: '.', finger: 'right-ring' },
    { key: '/', display: '/', finger: 'right-pinky' },
    { key: 'Shift', display: 'Shift', finger: 'right-pinky', width: 'w-16' },
  ],
  // Row 4
  [
    { key: ' ', display: 'Space Bar', finger: 'thumb', width: 'w-72' },
  ],
];

// Kode warna per jari (Playful & Kontras)
const FINGER_STYLES: Record<KeyHandFinger, { bg: string; text: string; label: string }> = {
  'left-pinky': { bg: 'border-pink-500/40 text-pink-400', text: 'text-pink-400', label: 'Kelingking Kiri' },
  'left-ring': { bg: 'border-orange-500/40 text-orange-400', text: 'text-orange-400', label: 'Jari Manis Kiri' },
  'left-middle': { bg: 'border-yellow-500/40 text-yellow-400', text: 'text-yellow-400', label: 'Jari Tengah Kiri' },
  'left-index': { bg: 'border-emerald-500/40 text-emerald-400', text: 'text-emerald-400', label: 'Jari Telunjuk Kiri' },
  'thumb': { bg: 'border-indigo-500/40 text-indigo-400', text: 'text-indigo-400', label: 'Ibu Jari (Spasi)' },
  'right-index': { bg: 'border-cyan-500/40 text-cyan-400', text: 'text-cyan-400', label: 'Jari Telunjuk Kanan' },
  'right-middle': { bg: 'border-blue-500/40 text-blue-400', text: 'text-blue-400', label: 'Jari Tengah Kanan' },
  'right-ring': { bg: 'border-purple-500/40 text-purple-400', text: 'text-purple-400', label: 'Jari Manis Kanan' },
  'right-pinky': { bg: 'border-rose-500/40 text-rose-400', text: 'text-rose-400', label: 'Kelingking Kanan' },
};

const SHIFT_SYMBOL_MAP: Record<string, string> = {
  '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
  '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/',
  '~': '`',
};

function getFingerForChar(char: string): { finger: KeyHandFinger; keyDisplay: string; isShift?: boolean } | null {
  if (!char) return null;
  const isShiftSymbol = Boolean(SHIFT_SYMBOL_MAP[char]);
  const isUpperAlpha = /^[A-Z]$/.test(char);
  const baseChar = SHIFT_SYMBOL_MAP[char] || char.toLowerCase();

  for (const row of KEYBOARD_ROWS) {
    for (const item of row) {
      if (item.key.toLowerCase() === baseChar || (char === ' ' && item.key === ' ') || (char === '\n' && item.key === 'Enter')) {
        return {
          finger: item.finger,
          keyDisplay: item.display,
          isShift: isShiftSymbol || isUpperAlpha,
        };
      }
    }
  }
  return null;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ currentChar }) => {
  const currentTarget = getFingerForChar(currentChar);
  const baseTargetChar = SHIFT_SYMBOL_MAP[currentChar] || (currentChar === '\n' ? 'enter' : currentChar.toLowerCase());

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-4xl mx-auto p-4 md:p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur">
      {/* Guidance Banner */}
      <div className="flex items-center justify-between w-full px-4 py-2 bg-slate-800/80 rounded-xl text-sm border border-slate-700/60">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Tekan:</span>
          <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold text-base border border-amber-500/40">
            {currentChar === ' ' ? 'Spasi' : currentChar === '\n' ? 'Enter ↵' : currentChar || 'Selesai'}
          </span>
        </div>
        {currentTarget && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Gunakan:</span>
            <span className={`font-semibold ${FINGER_STYLES[currentTarget.finger].text}`}>
              {FINGER_STYLES[currentTarget.finger].label}
            </span>
          </div>
        )}
      </div>

      {/* Keyboard Grid */}
      <div className="flex flex-col gap-1.5 w-full items-center">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1.5 justify-center w-full">
            {row.map((k) => {
              const isShiftKey = k.key === 'Shift' && Boolean(currentTarget?.isShift);
              const isMatch =
                k.key.toLowerCase() === baseTargetChar ||
                (currentChar === ' ' && k.key === ' ') ||
                (currentChar === '\n' && k.key === 'Enter') ||
                isShiftKey;

              const fingerStyle = FINGER_STYLES[k.finger];
              const isHomeBar = k.key === 'f' || k.key === 'j';

              return (
                <div
                  key={k.key + k.display}
                  className={`relative flex items-center justify-center font-mono select-none transition-all duration-100 ${
                    k.width ? k.width : 'w-10 sm:w-12 md:w-14'
                  } h-11 md:h-12 rounded-lg border text-sm md:text-base font-medium ${
                    isMatch
                      ? 'bg-amber-400 text-slate-950 font-bold border-amber-300 shadow-[0_0_15px_#F59E0B] scale-105 z-10'
                      : `bg-slate-800/90 text-slate-300 ${fingerStyle.bg} hover:bg-slate-700/80`
                  }`}
                >
                  {k.display}
                  {/* Tanda benjolan jari pada tombol F dan J */}
                  {isHomeBar && !isMatch && (
                    <span className="absolute bottom-1 w-2.5 h-[2px] bg-slate-400 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend Warna Jari */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-slate-400">
        <span className="text-slate-500 font-medium">Panduan Jari:</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Kelingking</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Jari Manis</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Jari Tengah</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Telunjuk Kiri</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Jempol</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Telunjuk Kanan</span>
      </div>
    </div>
  );
};
