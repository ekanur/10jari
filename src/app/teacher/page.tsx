'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DEFAULT_QUIZ_BANK, getCustomQuizzes, deleteCustomQuiz } from '@/lib/quizBank';
import { createLiveRoom } from '@/lib/realtimeService';
import { QuizItem, QuizRound, LiveRoom } from '@/types';
import { useTeacherAuth } from '@/hooks/useTeacherAuth';
import { GraduationCap, Plus, Play, Trash2, Code2, BookOpen, Layers, CheckCircle2, LogOut, User, Radio, Users, ArrowRight } from 'lucide-react';

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { teacher, logout } = useTeacherAuth();
  const [customQuizzes, setCustomQuizzes] = useState<QuizItem[]>([]);
  const [activeTab, setActiveTab] = useState<'custom' | 'default'>('custom');
  const [activeRooms, setActiveRooms] = useState<LiveRoom[]>([]);

  const fetchActiveRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (data.success && data.rooms) {
        setActiveRooms(data.rooms);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    setCustomQuizzes(getCustomQuizzes());
    fetchActiveRooms();

    // Polling berkala setiap 4 detik untuk update room aktif
    const interval = setInterval(fetchActiveRooms, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus kuis ini?')) {
      deleteCustomQuiz(id);
      setCustomQuizzes(getCustomQuizzes());
    }
  };

  const handleCloseRoom = async (pin: string) => {
    if (confirm(`Yakin ingin menutup dan menghapus sesi Room #${pin}?`)) {
      try {
        await fetch(`/api/rooms/${pin}`, { method: 'DELETE' });
        fetchActiveRooms();
      } catch {
        // ignore
      }
    }
  };

  // Mulai Live Room dari 1 atau beberapa kuis terpilih
  const handleStartRoom = async (quiz: QuizItem) => {
    const rounds: QuizRound[] = [
      {
        roundNumber: 1,
        title: quiz.title,
        text: quiz.text,
        isCode: quiz.isCode,
      },
    ];

    const newRoom = await createLiveRoom(quiz.title, 'Guru Kelas', rounds);
    router.push(`/teacher/host/${newRoom.pin}`);
  };

  // Buat Live Room multi-ronde gabungan
  const handleStartMultiRoundRoom = async () => {
    const rounds: QuizRound[] = [
      {
        roundNumber: 1,
        title: 'Ronde 1: Home Row Dasar (Pemanasan)',
        text: 'asdf jkl; asdf jkl; fads jads klas lada jala fasal fajar salak salsa daska',
      },
      {
        roundNumber: 2,
        title: 'Ronde 2: Baris Angka & Alfanumerik',
        text: 'kelas 10 nomor 45 tahun 2026 harga 75000 diskon 15 persen kamar 302 lantai 4',
      },
      {
        roundNumber: 3,
        title: 'Ronde 3: Sintaks Kode JavaScript',
        text: 'const filterScores = (scores, min) => scores.filter(s => s >= min);',
        isCode: true,
      },
    ];

    const newRoom = await createLiveRoom('Turnamen 10 Jari Kelas (3 Ronde)', 'Guru Kelas', rounds);
    router.push(`/teacher/host/${newRoom.pin}`);
  };

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20">
              <GraduationCap className="w-4 h-4" /> Portal Pendidik
            </div>
            {teacher && (
              <span className="flex items-center gap-1.5 text-xs text-slate-300 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700">
                <User className="w-3.5 h-3.5 text-purple-400" />
                {teacher.name}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-white">Dashboard Guru</h1>
          <p className="text-slate-400 text-sm mt-1">
            Kelola bank materi pengetikan, input kode pemrograman, dan luncurkan Live Room kelas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleStartMultiRoundRoom}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            Luncurkan 3 Ronde
          </button>

          <Link
            href="/teacher/editor"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Buat Soal
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 font-semibold text-xs border border-slate-700 hover:border-rose-500/40 transition-all"
            title="Keluar dari Portal Guru"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>

      {/* Active Rooms Menu / Banner */}
      {activeRooms.length > 0 && (
        <div className="my-6 p-5 rounded-3xl bg-slate-900/90 border border-purple-500/30 shadow-2xl backdrop-blur animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                Room Aktif Sedang Berlangsung ({activeRooms.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">Pendidik dapat langsung kembali memimpin room</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
            {activeRooms.map((r) => {
              const playerCount = Object.keys(r.players || {}).length;
              let statusText = 'Di Lobby';
              let statusBg = 'bg-slate-800 text-slate-300 border-slate-700';

              if (r.status === 'in-progress') {
                statusText = 'Sedang Balapan';
                statusBg = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
              } else if (r.status === 'countdown') {
                statusText = 'Hitung Mundur';
                statusBg = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
              } else if (r.status === 'round-ended') {
                statusText = 'Akhir Ronde';
                statusBg = 'bg-purple-500/20 text-purple-400 border-purple-500/40';
              }

              return (
                <div
                  key={r.pin}
                  className="flex flex-col justify-between p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-base font-black text-amber-400 tracking-wider bg-slate-900 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                          #{r.pin}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${statusBg}`}>
                          {statusText}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-sm line-clamp-1">{r.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                          {playerCount} Siswa
                        </span>
                        <span>•</span>
                        <span>Ronde {r.currentRoundIndex + 1} dari {r.rounds.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => handleCloseRoom(r.pin)}
                      className="text-slate-500 hover:text-rose-400 text-xs font-semibold px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Tutup Sesi Room"
                    >
                      Tutup Room
                    </button>

                    <Link
                      href={`/teacher/host/${r.pin}`}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all hover:scale-105"
                    >
                      <span>Buka Layar Host</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center gap-3 my-6">
        <button
          onClick={() => setActiveTab('custom')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
            activeTab === 'custom'
              ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Bank Teks Buatan Guru ({customQuizzes.length})
        </button>

        <button
          onClick={() => setActiveTab('default')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
            activeTab === 'default'
              ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Materi Bawaan Sistem ({DEFAULT_QUIZ_BANK.length})
        </button>
      </div>

      {/* Quiz List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeTab === 'custom' && customQuizzes.length === 0 && (
          <div className="col-span-full p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">Belum Ada Soal Buatan Sendiri</h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-md mx-auto">
              Anda dapat menginput teks paragraf bebas atau potongan kode pemrograman (JS, HTML, Python, dll.) untuk diketik siswa.
            </p>
            <Link
              href="/teacher/editor"
              className="inline-flex items-center gap-2 px-5 py-2.5 mt-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              <Plus className="w-4 h-4" /> Tambah Soal Pertama
            </Link>
          </div>
        )}

        {(activeTab === 'custom' ? customQuizzes : DEFAULT_QUIZ_BANK).map((quiz) => (
          <div
            key={quiz.id}
            className="flex flex-col justify-between p-5 bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {quiz.isCode ? (
                    <>
                      <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-cyan-400">Kode Pemrograman</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{quiz.category}</span>
                    </>
                  )}
                </span>

                <span className="text-[11px] font-mono text-slate-500">
                  {quiz.text.length} Karakter
                </span>
              </div>

              <h3 className="text-base font-bold text-white">{quiz.title}</h3>
              <p className="text-slate-400 text-xs mt-2 line-clamp-2 font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                {quiz.text}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80">
              {activeTab === 'custom' ? (
                <button
                  onClick={() => handleDelete(quiz.id)}
                  className="text-rose-400 hover:text-rose-300 p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
                  title="Hapus Kuis"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={() => handleStartRoom(quiz)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Buka Live Room
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
