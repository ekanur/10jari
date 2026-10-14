# Product Requirements Document (PRD)
## Aplikasi Latihan Mengetik 10 Jari: TypeArena (EduTyping)

### 1. Visi & Tujuan Produk
Aplikasi web edukatif yang dirancang khusus untuk meningkatkan keterampilan mengetik 10 jari siswa sekolah. Mengombinasikan engine pengetikan akurat (ala Monkeytype), visualisasi keyboard pemandu 10 jari (ala TotType/TypingClub), serta gamifikasi kuis langsung multi-ronde berbasis room (ala Kahoot/TypeRacer).

### 2. Pengguna Utama (Target Persona)
1. **Siswa (Peserta Didik):**
   - Ingin mengukur kecepatan mengetik (WPM) dan akurasi secara riil.
   - Belajar posisi penempatan 10 jari yang benar saat latihan mandiri.
   - Mengikuti kuis kompetisi live di kelas dengan seru menggunakan avatar dan PIN room tanpa perlu registrasi akun yang rumit.
2. **Guru (Pendidik / Instruktur):**
   - Memiliki akun/dashboard untuk mengelola paket kuis.
   - Dapat memasukkan teks kustom, materi bacaan, dan **potongan kode pemrograman (syntax code)**.
   - Membuka sesi Live Room, mengontrol jalannya ronde, dan memantau performa siswa secara real-time.

### 3. Fitur Utama

#### A. Mode Latihan Mandiri (Solo Practice)
- Pilihan kategori materi:
  - **Level 10 Jari (Bilingual ID/EN):** Home Row (`asdf jkl;`), Top Row (`qwerty uiop`), Bottom Row (`zxcvb nm`), All Letters.
  - **Mode Angka & Simbol:** Latihan baris atas keyboard (`1234567890`) dan tanda baca.
  - **Mode Teks & Kutipan:** Paragraf edukatif & inspiratif (ID & EN).
  - **Mode Kode Pemrograman (Code Typing):** Potongan sintaks HTML, CSS, JavaScript, dan Python.
- **Keyboard Virtual Interaktif:** Menyorot tuts yang perlu ditekan berikutnya secara visual.
- **Hasil & Evaluasi:** Net WPM, Gross WPM, Akurasi %, Waktu pengetikan, dan konsistensi.

#### B. Mode Live Room (Multi-Round Quiz ala Kahoot)
- **Lobby Room:** Guru membuka room dan membagikan PIN 6-digit. Siswa bergabung dengan PIN, Nama, dan memilih Avatar lucu.
- **Tampilan Pengetikan Minimalis (Monkeytype Style):** Saat balapan dimulai, keyboard virtual disembunyikan agar siswa fokus penuh pada teks, kursor dinamis, dan baris progres balapan lawan.
- **Mekanisme Multi-Ronde:**
  1. Hitung mundur serentak 3-2-1.
  2. Balapan pengetikan dengan progress bar real-time.
  3. Ronde berakhir saat waktu habis atau siswa selesai.
  4. Leaderboard sementara per ronde.
  5. Guru menekan tombol "Lanjut ke Ronde Berikutnya".
- **Final Podium:** Perayaan 3 besar dengan animasi podium dan efek konfeti di akhir seluruh ronde.

#### C. Teacher Dashboard & Quiz Editor
- Manajemen paket kuis multi-ronde.
- Input kustom: Guru dapat menambahkan ronde teks bebas maupun sintaks kode pemrograman.
- Generator kuis instan dari bank materi sistem.

#### D. Engine Mengetik & Anti-Cheat
- Kalkulasi Net WPM: `(Karakter Benar / 5) / (Waktu Menit) * Akurasi`.
- Sistem koreksi bebas (karakter salah merah, bisa backspace atau lanjut).
- Proteksi copy-paste dinonaktifkan otomatis di input pengetikan.
