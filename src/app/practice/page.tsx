'use client';

import React, { useState, useMemo } from 'react';
import { DEFAULT_QUIZ_BANK, getCustomQuizzes } from '@/lib/quizBank';
import { QuizCategory, QuizItem } from '@/types';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import { TypingDisplay } from '@/components/typing/TypingDisplay';
import { VirtualKeyboard } from '@/components/typing/VirtualKeyboard';
import { StatsCard } from '@/components/typing/StatsCard';
import { Volume2, VolumeX, Sparkles, Code2, BookOpen, Hash, Layers } from 'lucide-react';

const CATEGORY_TABS: { id: QuizCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'home-row', label: 'Home Row (ASDF)', icon: <Layers className="w-4 h-4" /> },
  { id: 'top-row', label: 'Top Row (QWERTY)', icon: <Layers className="w-4 h-4" /> },
  { id: 'bottom-row', label: 'Bottom Row (ZXCV)', icon: <Layers className="w-4 h-4" /> },
  { id: 'numbers', label: 'Baris Angka (0-9)', icon: <Hash className="w-4 h-4" /> },
  { id: 'sentences-id', label: 'Kalimat Indonesia', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'sentences-en', label: 'English Quotes', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'code-js', label: 'Sintaks Kode (JS/HTML/Py)', icon: <Code2 className="w-4 h-4" /> },
];

export default function PracticePage() {
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory>('home-row');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Ambil semua quiz (default + custom)
  const allQuizzes = useMemo(() => {
    return [...DEFAULT_QUIZ_BANK, ...getCustomQuizzes()];
  }, []);

  const filteredQuizzes = useMemo(() => {
    if (selectedCategory === 'code-js') {
      return allQuizzes.filter((q) => q.isCode);
    }
    return allQuizzes.filter((q) => q.category === selectedCategory);
  }, [allQuizzes, selectedCategory]);

  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const activeQuiz: QuizItem = filteredQuizzes[currentQuizIndex] || filteredQuizzes[0] || allQuizzes[0];

  const { input, stats, currentIndex, currentChar, isCompleted, reset } = useTypingEngine({
    targetText: activeQuiz.text,
    enableSound: soundEnabled,
  });

  const handleNextQuiz = () => {
    const nextIdx = (currentQuizIndex + 1) % filteredQuizzes.length;
    setCurrentQuizIndex(nextIdx);
    reset();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start max-w-5xl w-full mx-auto px-4 py-8 gap-6">
      {/* Header Info & Sound Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Mode Latihan Mandiri
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {activeQuiz.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-all"
            title="Efek Suara Ketikan"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Audio Aktif</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-500" />
                <span>Audio Mute</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 no-scrollbar">
        {CATEGORY_TABS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setCurrentQuizIndex(0);
              reset();
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Real-time Status Bar */}
      <div className="flex items-center justify-between w-full px-6 py-3 bg-slate-900/80 rounded-2xl border border-slate-800/80 shadow-md">
        <div className="flex items-center gap-6 font-mono text-sm">
          <div>
            <span className="text-slate-500 text-xs block">NET WPM</span>
            <span className="text-amber-400 font-bold text-xl">{stats.netWpm}</span>
          </div>
          <div>
            <span className="text-slate-500 text-xs block">AKURASI</span>
            <span className="text-emerald-400 font-bold text-xl">{stats.accuracy}%</span>
          </div>
          <div>
            <span className="text-slate-500 text-xs block">WAKTU</span>
            <span className="text-slate-300 font-medium text-xl">{stats.elapsedSeconds}s</span>
          </div>
        </div>

        <button
          onClick={reset}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
        >
          Reset Teks
        </button>
      </div>

      {/* Main Typing Area or Stats Card if completed */}
      {isCompleted ? (
        <StatsCard
          stats={stats}
          onRestart={reset}
          onNext={filteredQuizzes.length > 1 ? handleNextQuiz : undefined}
          title={`Selamat! ${activeQuiz.title} Selesai`}
        />
      ) : (
        <div className="flex flex-col gap-6 w-full">
          <TypingDisplay
            targetText={activeQuiz.text}
            input={input}
            currentIndex={currentIndex}
            isCode={activeQuiz.isCode}
          />

          {/* Interactive 10-Finger Keyboard */}
          <div className="w-full pt-2">
            <VirtualKeyboard currentChar={currentChar} />
          </div>
        </div>
      )}
    </div>
  );
}
