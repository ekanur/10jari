'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AvatarPicker } from '@/components/ui/AvatarPicker';
import { PlayerAvatar } from '@/types';
import { Users, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import { RoomManager } from '@/lib/realtimeService';

export default function JoinPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<PlayerAvatar>('fox');
  const [error, setError] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPin = pin.trim();
    const cleanName = name.trim();

    if (!cleanPin || cleanPin.length < 4) {
      setError('Masukkan Kode PIN Room yang valid dari Guru (4-6 angka).');
      return;
    }

    if (!cleanName) {
      setError('Masukkan Nama atau No. Absen Anda.');
      return;
    }

    // Periksa apakah room ada
    const manager = new RoomManager(cleanPin);
    const room = manager.getRoom();

    if (!room) {
      setError('Room tidak ditemukan. Pastikan kode PIN sudah benar dan Guru sudah membuka room.');
      return;
    }

    // Generate player ID
    const playerId = `player-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Simpan identitas ke sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('typearena_player_id', playerId);
      sessionStorage.setItem('typearena_player_name', cleanName);
      sessionStorage.setItem('typearena_player_avatar', avatar);
    }

    // Join room
    manager.joinPlayer({
      id: playerId,
      name: cleanName,
      avatar,
      progress: 0,
      currentWpm: 0,
      netWpm: 0,
      accuracy: 100,
      completed: false,
      score: 0,
    });

    router.push(`/play/${cleanPin}`);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 mb-3 shadow-lg shadow-amber-500/10">
            <Users className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Gabung Live Room</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Masukkan PIN room dari guru untuk memulai kuis balapan!
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          {/* PIN Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              Kode PIN Room
            </label>
            <input
              type="text"
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Contoh: 123456"
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700/80 text-center font-mono text-2xl tracking-widest text-amber-400 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Nama Lengkap / No. Absen
            </label>
            <input
              type="text"
              maxLength={24}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso (12)"
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Pilih Karakter Avatar
            </label>
            <AvatarPicker selected={avatar} onSelect={setAvatar} />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02]"
          >
            <span>Masuk ke Arena Balapan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
