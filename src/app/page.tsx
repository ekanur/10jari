'use client';

import React from 'react';
import Link from 'next/link';
import { Keyboard, Users, GraduationCap, Gamepad2, Sparkles, Trophy, Code2, Zap, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-6xl w-full mx-auto px-4 py-12 md:py-16">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs sm:text-sm font-bold uppercase tracking-wider mb-6 shadow-sm">
        <Sparkles className="w-4 h-4 text-amber-400" />
        EduTyping • Aplikasi Latihan 10 Jari Sekolah
      </div>

      {/* Hero Title */}
      <h1 className="text-4xl sm:text-6xl font-black text-center text-white tracking-tight max-w-4xl leading-tight sm:leading-none">
        Kuasai Mengetik <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">10 Jari</span> dengan Kuis Live Kompetitif
      </h1>

      <p className="text-slate-400 text-sm sm:text-base text-center max-w-2xl mt-5 leading-relaxed">
        Gabungan presisi engine mengetik ala <span className="text-slate-200 font-semibold">Monkeytype</span>, panduan keyboard virtual 10 jari, serta keseruan kompetisi multi-ronde berbasis room ala <span className="text-slate-200 font-semibold">Kahoot</span>.
      </p>

      {/* Main Action Cards (3 Pillars) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-12">
        {/* Card 1: Latihan Mandiri */}
        <div className="flex flex-col justify-between p-6 sm:p-8 bg-slate-900/80 rounded-3xl border border-slate-800 hover:border-indigo-500/50 transition-all shadow-xl group hover:scale-[1.02]">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 mb-5 group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Latihan Mandiri</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Latih posisi jari Anda dengan keyboard virtual interaktif. Tersedia latihan Home Row, baris angka, kalimat bilingual (ID/EN), hingga sintaks kode pemrograman.
            </p>

            <div className="flex flex-wrap gap-1.5 mt-4">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">ASDF JKL;</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">Angka 0-9</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">Kode JS/HTML/Py</span>
            </div>
          </div>

          <Link
            href="/practice"
            className="mt-6 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <span>Mulai Latihan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 2: Gabung Live Room (Siswa) */}
        <div className="flex flex-col justify-between p-6 sm:p-8 bg-slate-900/80 rounded-3xl border border-slate-800 hover:border-amber-500/50 transition-all shadow-xl group hover:scale-[1.02] ring-1 ring-amber-500/20">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 mb-5 group-hover:scale-110 transition-transform">
              <Trophy className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Gabung Live Room</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Punya Kode PIN dari guru? Bergabunglah bersama teman sekelas, pilih avatar hewan lucu, dan berlombalah menjadi pengetik 10 jari tercepat di papan podium!
            </p>

            <div className="flex flex-wrap gap-1.5 mt-4">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">PIN 6 Angka</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">Avatar Lucu</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">Multi-Ronde</span>
            </div>
          </div>

          <Link
            href="/join"
            className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
          >
            <span>Masukkan PIN Siswa</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 3: Portal Pendidik (Guru) */}
        <div className="flex flex-col justify-between p-6 sm:p-8 bg-slate-900/80 rounded-3xl border border-slate-800 hover:border-purple-500/50 transition-all shadow-xl group hover:scale-[1.02]">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 mb-5 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Portal Pendidik</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Buat bank materi sendiri, input teks ujian bebas atau potongan kode pemrograman, buka Live Room dengan proyektor kelas, dan kendalikan setiap babak ronde.
            </p>

            <div className="flex flex-wrap gap-1.5 mt-4">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">Editor Teks & Kode</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">Kendali Host</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">Rekap Nilai</span>
            </div>
          </div>

          <Link
            href="/teacher"
            className="mt-6 w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
          >
            <span>Buka Dashboard Guru</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mt-16 pt-10 border-t border-slate-800/80 text-center">
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
          <Zap className="w-5 h-5 text-amber-400 mx-auto mb-2" />
          <div className="font-bold text-white text-sm">Net WPM & Akurasi</div>
          <div className="text-slate-400 text-xs mt-1">Kalkulasi presisi tanpa toleransi typo</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
          <Keyboard className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
          <div className="font-bold text-white text-sm">Panduan 10 Jari</div>
          <div className="text-slate-400 text-xs mt-1">Warna tuts sesuai posisi masing-masing jari</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
          <Code2 className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
          <div className="font-bold text-white text-sm">Mode Kode Program</div>
          <div className="text-slate-400 text-xs mt-1">Latihan simbol dan sintaks JS/HTML/Py</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
          <Users className="w-5 h-5 text-purple-400 mx-auto mb-2" />
          <div className="font-bold text-white text-sm">Balapan Kelas Live</div>
          <div className="text-slate-400 text-xs mt-1">Multiplayer multi-ronde & podium akhir</div>
        </div>
      </div>
    </div>
  );
}
