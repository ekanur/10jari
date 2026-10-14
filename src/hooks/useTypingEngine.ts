'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TypingStats } from '@/types';

export interface UseTypingEngineProps {
  targetText: string;
  onComplete?: (finalStats: TypingStats) => void;
  enableSound?: boolean;
}

export function useTypingEngine({ targetText, onComplete, enableSound = true }: UseTypingEngineProps) {
  const [input, setInput] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // Audio Context Ref for mechanical click sound
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playClickSound = useCallback((isError = false) => {
    if (!enableSound || typeof window === 'undefined') return;
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isError ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(isError ? 150 : 600, ctx.currentTime);
      gain.gain.setValueAtTime(isError ? 0.08 : 0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // Audio not supported or blocked by browser policy
    }
  }, [enableSound]);

  // Reset engine when targetText changes
  useEffect(() => {
    setInput('');
    setStartTime(null);
    setEndTime(null);
    setElapsedSeconds(0);
    setIsCompleted(false);
    setHasStarted(false);
  }, [targetText]);

  // Timer interval
  useEffect(() => {
    if (!hasStarted || isCompleted || !startTime) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.max(1, Math.floor((Date.now() - startTime) / 1000)));
    }, 500);

    return () => clearInterval(interval);
  }, [hasStarted, isCompleted, startTime]);

  // Calculate statistics
  const totalTyped = input.length;
  let correctChars = 0;
  let incorrectChars = 0;

  for (let i = 0; i < input.length; i++) {
    if (input[i] === targetText[i]) {
      correctChars++;
    } else {
      incorrectChars++;
    }
  }

  const durationMinutes = Math.max(elapsedSeconds, 1) / 60;
  const rawWpm = Math.round((totalTyped / 5) / durationMinutes);
  const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
  const netWpm = Math.max(0, Math.round(rawWpm * (accuracy / 100)));

  const stats: TypingStats = {
    wpm: rawWpm,
    netWpm,
    accuracy,
    elapsedSeconds,
    totalChars: targetText.length,
    correctChars,
    incorrectChars,
    isCompleted,
  };

  // Keystroke handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore meta keys, functions keys, Tab, etc.
    if (e.ctrlKey || e.altKey || e.metaKey || isCompleted) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      setInput((prev) => prev.slice(0, -1));
      playClickSound(false);
      return;
    }

    // Only process printable single characters or Enter
    if (e.key.length === 1 || e.key === 'Enter') {
      e.preventDefault();
      const charToAdd = e.key === 'Enter' ? '\n' : e.key;

      if (!hasStarted) {
        setHasStarted(true);
        setStartTime(Date.now());
      }

      setInput((prev) => {
        if (prev.length >= targetText.length) return prev;
        const nextInput = prev + charToAdd;

        const isCorrect = charToAdd === targetText[prev.length];
        playClickSound(!isCorrect);

        // Check if finished
        if (nextInput.length === targetText.length) {
          setIsCompleted(true);
          const finishedTime = Date.now();
          setEndTime(finishedTime);
          const finalDuration = Math.max(1, Math.floor((finishedTime - (startTime || finishedTime)) / 1000));
          setElapsedSeconds(finalDuration);

          let finalCorrect = 0;
          for (let i = 0; i < nextInput.length; i++) {
            if (nextInput[i] === targetText[i]) finalCorrect++;
          }
          const finalMinutes = finalDuration / 60;
          const finalRaw = Math.round((nextInput.length / 5) / finalMinutes);
          const finalAcc = Math.round((finalCorrect / nextInput.length) * 100);
          const finalNet = Math.max(0, Math.round(finalRaw * (finalAcc / 100)));

          if (onComplete) {
            onComplete({
              wpm: finalRaw,
              netWpm: finalNet,
              accuracy: finalAcc,
              elapsedSeconds: finalDuration,
              totalChars: targetText.length,
              correctChars: finalCorrect,
              incorrectChars: nextInput.length - finalCorrect,
              isCompleted: true,
            });
          }
        }

        return nextInput;
      });
    }
  }, [hasStarted, isCompleted, onComplete, playClickSound, startTime, targetText]);

  // Attach global keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const reset = () => {
    setInput('');
    setStartTime(null);
    setEndTime(null);
    setElapsedSeconds(0);
    setIsCompleted(false);
    setHasStarted(false);
  };

  return {
    input,
    stats,
    hasStarted,
    isCompleted,
    currentIndex: input.length,
    currentChar: targetText[input.length] || '',
    reset,
  };
}
