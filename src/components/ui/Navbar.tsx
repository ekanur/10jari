'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Keyboard, Users, GraduationCap, Gamepad2 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  // Jika sedang di dalam sesi pengetikan balapan, tampilkan navbar yang ringkas
  const isRaceSession = pathname.startsWith('/play/') || pathname.startsWith('/teacher/host/');

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-950/70 border-b border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Keyboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              Type<span className="text-amber-400">Arena</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                10 Jari
              </span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        {!isRaceSession && (
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/practice"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                pathname === '/practice'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
              <span>Latihan Mandiri</span>
            </Link>

            <Link
              href="/join"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                pathname === '/join'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Gabung Room</span>
            </Link>

            <Link
              href="/teacher"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                pathname.startsWith('/teacher')
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span>Portal Guru</span>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};
