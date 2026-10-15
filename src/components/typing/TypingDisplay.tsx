'use client';

import React from 'react';

interface TypingDisplayProps {
  targetText: string;
  input: string;
  currentIndex: number;
  isCode?: boolean;
}

export const TypingDisplay: React.FC<TypingDisplayProps> = ({
  targetText,
  input,
  currentIndex,
  isCode = false,
}) => {
  const textToRender = targetText || '';

  if (textToRender.length === 0) {
    return (
      <div className="w-full rounded-2xl p-8 bg-slate-900/90 border border-slate-700/80 text-center font-mono text-slate-500 italic">
        Menyiapkan teks pengetikan...
      </div>
    );
  }

  return (
    <div
      className="relative w-full rounded-2xl p-6 md:p-8 bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur select-none overflow-x-hidden"
      onCopy={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
    >
      {isCode && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-cyan-400 font-mono">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400/80 inline-block" />
            Mode Kode Pemrograman (Word-Wrap Aktif)
          </span>
          <span className="text-slate-500 text-[11px]">Tekan [Enter] untuk baris baru ↵</span>
        </div>
      )}

      <div
        className={`font-mono text-xl md:text-2xl leading-relaxed tracking-wider transition-all break-words [overflow-wrap:anywhere] whitespace-pre-wrap ${
          isCode ? 'font-medium' : ''
        }`}
      >
        {textToRender.split('').map((char, index) => {
          let charColor = 'text-slate-500';
          let bgColor = '';
          const isCurrent = index === currentIndex;

          if (index < input.length) {
            if (input[index] === char) {
              charColor = 'text-slate-100';
            } else {
              charColor = 'text-red-400 font-bold';
              bgColor = 'bg-red-500/20 rounded';
            }
          }

          if (char === '\n') {
            return (
              <React.Fragment key={index}>
                <span className="relative inline-block">
                  {isCurrent && (
                    <span className="absolute -left-[2px] top-1 bottom-1 w-[3px] bg-amber-400 rounded-full animate-caret-blink shadow-[0_0_8px_#F59E0B]" />
                  )}
                  <span className={`${charColor} ${bgColor} text-sm font-sans opacity-70 px-0.5 select-none`}>
                    ↵
                  </span>
                </span>
                <br />
              </React.Fragment>
            );
          }

          return (
            <span key={index} className="relative inline-block">
              {/* Caret / Cursor */}
              {isCurrent && (
                <span className="absolute -left-[2px] top-1 bottom-1 w-[3px] bg-amber-400 rounded-full animate-caret-blink shadow-[0_0_8px_#F59E0B]" />
              )}
              <span className={`${charColor} ${bgColor} transition-colors duration-75`}>
                {char}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};
