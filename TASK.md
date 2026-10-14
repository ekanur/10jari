# Task Tracker (`TASK.md`)
*Project: TypeArena (10-Finger Typing & Live Quiz)*

## Fase 1: Setup Proyek & Konfigurasi Dasar
- [x] Step 1.1: Inisialisasi Next.js 14+ dengan TypeScript, Tailwind CSS, dan dependensi (`lucide-react`, `framer-motion`, `canvas-confetti`).
- [x] Step 1.2: Konfigurasi Tailwind CSS sesuai warna gamified dan font monospace di `DESIGN.md`.
- [x] Step 1.3: Buat definisi tipe data lengkap di `src/types/index.ts`.

## Fase 2: Core Typing Engine & Keyboard 10 Jari
- [x] Step 2.1: Implementasi `src/hooks/useTypingEngine.ts` (WPM, Net WPM, akurasi, backspace, anti-paste, kode sintaks).
- [x] Step 2.2: Buat komponen `src/components/typing/TypingDisplay.tsx` (teks interaktif, smooth caret, status warna).
- [x] Step 2.3: Buat komponen `src/components/typing/VirtualKeyboard.tsx` (highlight tuts berikutnya, kode warna jari).
- [x] Step 2.4: Buat komponen `src/components/typing/StatsCard.tsx` (tampilan hasil latihan).

## Fase 3: Bank Materi Bilingual & Kode Pemrograman
- [x] Step 3.1: Buat `src/lib/quizBank.ts` berisi latihan bertingkat:
  - 10 Jari Huruf (Home row, top row, bottom row) ID & EN.
  - Baris Angka (Number row 0-9) & Simbol.
  - Paragraf & Kutipan bilingual.
  - Sintaks Kode Pemrograman (HTML, JS, Python).
  - Utilitas penyimpanan kuis kustom lokal.

## Fase 4: Mode Latihan Mandiri (Solo Practice)
- [x] Step 4.1: Implementasi halaman `src/app/practice/page.tsx` dengan selektor kategori materi, mode keyboard virtual interaktif, dan kartu hasil skor.

## Fase 5: Sistem Live Room & Realtime Sync
- [x] Step 5.1: Implementasi `src/lib/realtimeService.ts` (manajemen room, join player, broadcast progress, next round trigger).
- [x] Step 5.2: Buat komponen pendukung live:
  - `AvatarPicker.tsx` (pilihan avatar siswa)
  - `RaceProgressTrack.tsx` (visual balapan progress bar live)
  - `RoundLeaderboard.tsx` (papan skor sementara tiap ronde)
  - `FinalPodium.tsx` (animasi juara 1, 2, 3 dengan konfeti)
- [x] Step 5.3: Buat halaman Siswa:
  - `src/app/join/page.tsx` (Form masukkan PIN, Nama, Avatar)
  - `src/app/play/[pin]/page.tsx` (Layar balapan minimalis Monkeytype & papan skor)
- [x] Step 5.4: Buat halaman Guru:
  - `src/app/teacher/page.tsx` (Dashboard paket kuis & buat room baru)
  - `src/app/teacher/editor/page.tsx` (Editor teks kustom & kode pemrograman)
  - `src/app/teacher/host/[pin]/page.tsx` (Lobby room, pemantau balapan live, kendali ronde, & podium)

## Fase 6: Landing Page & Polish
- [x] Step 6.1: Buat `src/app/page.tsx` (Landing page navigasi ke Solo, Join, & Teacher).
- [x] Step 6.2: Verifikasi menyeluruh: testing latihan mandiri, testing multi-tab live room, build verification (`next build` sukses).
