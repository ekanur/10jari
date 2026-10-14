# Architecture & Technical Design (`ARCHITECTURE.md`)
*TypeArena - 10-Finger Typing & Live Quiz Platform*

## 1. Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + PostCSS
- **Icons:** `lucide-react`
- **Animations & FX:** `framer-motion`, `canvas-confetti`
- **Realtime / Multiplayer:** Hybrid Architecture:
  - *Phase 1 (Active):* High-speed `BroadcastChannel` & LocalStorage Cross-Tab Sync Engine (zero-config, runs seamlessly offline/locally).
  - *Phase 2 (Ready):* Supabase Realtime Channels & Auth provider connector.

## 2. Struktur Direktori
```text
10jari/
├── docs/                 # Dokumentasi pendukung
├── PRD.md                # Kebutuhan produk & spesifikasi fitur
├── DESIGN.md             # Design tokens & panduan UI
├── ARCHITECTURE.md       # Arsitektur sistem & alur data
├── TASK.md               # Pelacak progres pengerjaan bertahap
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout dengan font & theme container
│   │   ├── page.tsx           # Landing page (Pilih Solo Practice, Join PIN, Guru Portal)
│   │   ├── globals.css        # Tailwind directives & caret animation
│   │   ├── practice/
│   │   │   └── page.tsx       # Mode Latihan Mandiri (Virtual Keyboard aktif)
│   │   ├── join/
│   │   │   └── page.tsx       # Portal Siswa: Masuk via PIN & Nama
│   │   ├── play/
│   │   │   └── [pin]/
│   │   │       └── page.tsx   # Layar Kompetisi Live Siswa (Minimalist Monkeytype)
│   │   └── teacher/
│   │       ├── page.tsx       # Dashboard Guru (Kelola Kuis & Riwayat)
│   │       ├── editor/
│   │       │   └── page.tsx   # Editor Kuis (Teks Bebas & Kode Pemrograman)
│   │       └── host/
│   │           └── [pin]/
│   │               └── page.tsx # Layar Host Guru (Lobby, Balapan Live, Podium)
│   ├── components/
│   │   ├── typing/
│   │   │   ├── TypingDisplay.tsx    # Komponen render teks aktif + kursor
│   │   │   ├── VirtualKeyboard.tsx  # Keyboard 10 jari interaktif
│   │   │   └── StatsCard.tsx        # Ringkasan WPM, Akurasi, Konsistensi
│   │   ├── room/
│   │   │   ├── RaceProgressTrack.tsx # Baris balapan siswa real-time
│   │   │   ├── RoundLeaderboard.tsx  # Papan skor antar ronde
│   │   │   └── FinalPodium.tsx       # Animasi podium 1, 2, 3 dengan konfeti
│   │   └── ui/
│   │       ├── Navbar.tsx
│   │       └── AvatarPicker.tsx     # Pilihan avatar gamifikasi untuk siswa
│   ├── hooks/
│   │   └── useTypingEngine.ts       # Hook inti kalkulasi ketikan, wpm, dan akurasi
│   ├── lib/
│   │   ├── quizBank.ts              # Bank kata 10 jari, angka, kalimat, & kode sintaks
│   │   └── realtimeService.ts       # Abstraksi sinkronisasi room & status peserta
│   └── types/
│       └── index.ts                 # Definisi tipe Room, Player, Round, Quiz
```

## 3. Alur State Mesin Pengetikan (`useTypingEngine`)
1. **Input Listening:** Menangkap input `keydown` global saat sesi aktif. Mencegah navigasi default pada tombol spasi.
2. **Karakter Matching:**
   - Cocokkan karakter ke-`i` dari teks target.
   - Jika benar: tambahkan indeks `correct`, status karakter = `'correct'`.
   - Jika salah: status karakter = `'incorrect'`.
   - Tombol *Backspace*: memundurkan kursor dan mengembalikan status karakter sebelumnya.
3. **Kalkulasi Metrik Realtime:**
   - $\text{Gross WPM} = \frac{\text{Total Input} / 5}{\text{Waktu (Menit)}}$
   - $\text{Accuracy} = \frac{\text{Karakter Benar}}{\text{Total Input}} \times 100\%$
   - $\text{Net WPM} = \text{Gross WPM} \times \left(\frac{\text{Accuracy}}{100}\right)$
