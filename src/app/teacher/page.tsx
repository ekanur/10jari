'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DEFAULT_QUIZ_BANK,
  getCustomQuizzes,
  deleteCustomQuiz,
  getAllQuizzes,
  getCategoryLabel,
  generateRandomRounds,
} from '@/lib/quizBank';
import { createLiveRoom } from '@/lib/realtimeService';
import { QuizItem, QuizRound, LiveRoom } from '@/types';
import { useTeacherAuth } from '@/hooks/useTeacherAuth';
import {
  GraduationCap,
  Plus,
  Play,
  Trash2,
  Code2,
  BookOpen,
  Layers,
  CheckCircle2,
  LogOut,
  User,
  Radio,
  Users,
  ArrowRight,
  Trophy,
  Dices,
  Settings2,
  X,
  Check,
  Sparkles,
} from 'lucide-react';

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { teacher, logout } = useTeacherAuth();
  const [customQuizzes, setCustomQuizzes] = useState<QuizItem[]>([]);
  const [activeTab, setActiveTab] = useState<'custom' | 'default'>('custom');
  const [activeRooms, setActiveRooms] = useState<LiveRoom[]>([]);

  // State Modal Konfigurasi Room (3-5 Babak)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [roomTitle, setRoomTitle] = useState('Turnamen 10 Jari Kelas');
  const [totalRounds, setTotalRounds] = useState<number>(3); // 3, 4, 5
  const [selectionMode, setSelectionMode] = useState<'random' | 'manual'>('random');
  const [randomRounds, setRandomRounds] = useState<QuizRound[]>([]);
  const [manualSelections, setManualSelections] = useState<string[]>([]);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

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

  // Helper untuk membuka modal Room Turnamen Baru
  const handleOpenCreateModal = () => {
    setRoomTitle('Turnamen 10 Jari Kelas');
    setTotalRounds(3);
    setSelectionMode('random');
    setRandomRounds(generateRandomRounds(3));

    const all = getAllQuizzes();
    setManualSelections([
      all[0]?.id || 'hr-1',
      all[1]?.id || 'tr-1',
      all[2]?.id || 'num-1',
    ]);
    setIsCreateModalOpen(true);
  };

  // Helper ketika Guru memilih materi tertentu dari card untuk dimasukkan ke Turnamen
  const handleUseQuizInTournament = (quiz: QuizItem) => {
    setRoomTitle(`Turnamen 10 Jari - ${quiz.title}`);
    setTotalRounds(3);
    setSelectionMode('manual');

    const all = getAllQuizzes();
    const others = all.filter((q) => q.id !== quiz.id);
    setManualSelections([
      quiz.id,
      others[0]?.id || 'tr-1',
      others[1]?.id || 'num-1',
    ]);
    setRandomRounds(generateRandomRounds(3));
    setIsCreateModalOpen(true);
  };

  // Ganti jumlah babak (3, 4, 5)
  const handleRoundCountChange = (count: number) => {
    const newCount = Math.min(5, Math.max(3, count));
    setTotalRounds(newCount);
    setRandomRounds(generateRandomRounds(newCount));

    const all = getAllQuizzes();
    setManualSelections((prev) => {
      const next = [...prev];
      while (next.length < newCount) {
        const unused = all.find((q) => !next.includes(q.id));
        next.push(unused ? unused.id : all[next.length % all.length]?.id || 'hr-1');
      }
      return next.slice(0, newCount);
    });
  };

  // Acak ulang babak pada Mode Acak
  const handleRerollRandom = () => {
    setRandomRounds(generateRandomRounds(totalRounds));
  };

  // Ganti pilihan kuis manual pada babak tertentu
  const handleSelectManualQuiz = (roundIndex: number, quizId: string) => {
    setManualSelections((prev) => {
      const next = [...prev];
      next[roundIndex] = quizId;
      return next;
    });
  };

  // Eksekusi Pembuatan Live Room
  const handleLaunchRoom = async () => {
    setIsCreatingRoom(true);
    try {
      let finalRounds: QuizRound[] = [];
      const all = getAllQuizzes();
      const quizMap = new Map(all.map((q) => [q.id, q]));

      if (selectionMode === 'random') {
        finalRounds = randomRounds.length >= 3 ? randomRounds : generateRandomRounds(totalRounds);
      } else {
        finalRounds = manualSelections.slice(0, totalRounds).map((id, idx) => {
          const item = quizMap.get(id) || all[0];
          return {
            roundNumber: idx + 1,
            title: item?.title || `Babak ${idx + 1}`,
            text: item?.text || '',
            category: getCategoryLabel(item?.category),
            isCode: item?.isCode || item?.category.startsWith('code-'),
          };
        });
      }

      const host = teacher?.name || 'Guru Kelas';
      const newRoom = await createLiveRoom(
        roomTitle.trim() || 'Turnamen 10 Jari Kelas',
        host,
        finalRounds
      );

      setIsCreateModalOpen(false);
      router.push(`/teacher/host/${newRoom.pin}`);
    } catch (err) {
      console.error('Error creating room:', err);
      alert('Terjadi kesalahan saat membuat room. Silakan coba lagi.');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const allAvailableQuizzes = getAllQuizzes();
  const allQuizMap = new Map(allAvailableQuizzes.map((q) => [q.id, q]));

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
            Kelola bank materi pengetikan, susun turnamen 3-5 babak, dan luncurkan Live Room kelas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition-all hover:scale-105"
          >
            <Trophy className="w-4 h-4 fill-slate-950" />
            Buat Live Room (3-5 Babak)
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
                onClick={() => handleUseQuizInTournament(quiz)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
                title="Gunakan materi ini dalam Live Room Turnamen"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Gunakan di Turnamen
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Buat Room Turnamen (3-5 Babak) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative my-8 flex flex-col gap-6 text-white max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Trophy className="w-5 h-5 fill-amber-400/20" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white">Buat Live Room Turnamen</h2>
                  <p className="text-xs text-slate-400">Konfigurasi 3 hingga 5 babak materi pengetikan untuk siswa</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Judul Turnamen */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Judul Room / Nama Turnamen
              </label>
              <input
                type="text"
                value={roomTitle}
                onChange={(e) => setRoomTitle(e.target.value)}
                placeholder="Contoh: Turnamen 10 Jari Kelas 10 RPL"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Pemilihan Jumlah Babak (Minimal 3, Maksimal 5) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Jumlah Babak (Ronde)
                </label>
                <span className="text-[11px] font-semibold text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  Minimal 3 • Maksimal 5
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {[3, 4, 5].map((count) => {
                  const isSelected = totalRounds === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handleRoundCountChange(count)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10 scale-[1.02]'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-lg font-black">{count} Babak</span>
                      <span className="text-[10px] opacity-80 mt-0.5">
                        {count === 3 ? 'Format Standar' : count === 4 ? 'Format Menengah' : 'Format Turnamen Penuh'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode Pemilihan Materi (Acak vs Manual) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Metode Penentuan Materi Pengetikan
              </label>
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectionMode('random')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    selectionMode === 'random'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Dices className="w-4 h-4" />
                  <span>Mode Acak Otomatis</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectionMode('manual')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    selectionMode === 'manual'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Settings2 className="w-4 h-4" />
                  <span>Pilih Manual per Babak</span>
                </button>
              </div>
            </div>

            {/* Konten Mode Acak */}
            {selectionMode === 'random' && (
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-200">
                      Rekomendasi Sistem (Kategori Berbeda per Babak)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRerollRandom}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-amber-500/20 transition-all hover:scale-105"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>Acak Ulang 🎲</span>
                  </button>
                </div>

                <div className="space-y-2.5 pt-1">
                  {randomRounds.slice(0, totalRounds).map((r, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-mono text-xs font-extrabold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 shrink-0">
                          Babak {r.roundNumber}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              {r.category || 'Materi Campuran'}
                            </span>
                            <span className="text-xs font-bold text-white line-clamp-1">
                              {r.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono mt-1 line-clamp-1">
                            {r.text}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 shrink-0 pt-0.5">
                        {r.text.length} Karakter
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Konten Mode Manual */}
            {selectionMode === 'manual' && (
              <div className="space-y-3.5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-xs text-slate-300 font-semibold pb-1 border-b border-slate-800">
                  Tentukan materi pengetikan untuk masing-masing babak:
                </div>

                <div className="space-y-3">
                  {Array.from({ length: totalRounds }).map((_, idx) => {
                    const selectedId = manualSelections[idx] || allAvailableQuizzes[0]?.id;
                    const selectedItem = allQuizMap.get(selectedId) || allAvailableQuizzes[0];

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-extrabold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-lg border border-purple-500/20">
                            Babak {idx + 1}
                          </span>
                          {selectedItem && (
                            <span className="text-[11px] text-slate-400">
                              Kategori: <strong className="text-slate-200">{getCategoryLabel(selectedItem.category)}</strong>
                            </span>
                          )}
                        </div>

                        <select
                          value={selectedId}
                          onChange={(e) => handleSelectManualQuiz(idx, e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-purple-500"
                        >
                          {customQuizzes.length > 0 && (
                            <optgroup label="Teks Buatan Guru (Kustom)">
                              {customQuizzes.map((q) => (
                                <option key={q.id} value={q.id}>
                                  ⭐ [Kustom] {q.title} ({q.text.length} kar)
                                </option>
                              ))}
                            </optgroup>
                          )}
                          <optgroup label="Bank Materi Bawaan Sistem">
                            {DEFAULT_QUIZ_BANK.map((q) => (
                              <option key={q.id} value={q.id}>
                                [{getCategoryLabel(q.category)}] {q.title} ({q.text.length} kar)
                              </option>
                            ))}
                          </optgroup>
                        </select>

                        {selectedItem && (
                          <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-slate-400 line-clamp-2">
                            {selectedItem.text}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Total <strong className="text-amber-400">{totalRounds} Babak</strong> siap diluncurkan ke siswa.
              </span>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isCreatingRoom}
                  onClick={handleLaunchRoom}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{isCreatingRoom ? 'Membuat Room...' : `Luncurkan (${totalRounds} Babak) 🚀`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
