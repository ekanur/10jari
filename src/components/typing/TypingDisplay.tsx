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
  return (
    <div
      className={`relative w-full rounded-2xl p-6 md:p-8 bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur select-none ${
        isCode ? 'overflow-x-auto' : ''
      }`}
      onCopy={(e) => e.preventDefault()}
      onPaste={(e) => e.preventDefault()}
    >
      <div
        className={`font-mono text-xl md:text-2xl leading-relaxed tracking-wider transition-all ${
          isCode ? 'whitespace-pre font-medium' : 'whitespace-pre-wrap'
        }`}
      >
        {targetText.split('').map((char, index) => {
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

          return (
            <span key={index} className="relative inline-block">
              {/* Caret / Cursor */}
              {isCurrent && (
                <span className="absolute -left-[2px] top-1 bottom-1 w-[3px] bg-amber-400 rounded-full animate-caret-blink shadow-[0_0_8px_#F59E0B]" />
              )}
              <span className={`${charColor} ${bgColor} transition-colors duration-75`}>
                {char === '\n' ? (
                  <span className="text-slate-600 text-sm">↵{'\n'}</span>
                ) : (
                  char
                )}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};
