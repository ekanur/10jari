# Design System & UI Guidelines (`DESIGN.md`)
*Generated for TypeArena - Playful Gamified School Edition*

## 1. Vibe & Karakter Visual
- **Tema:** Playful, Gamified, High-Energy (terinspirasi dari Kahoot/Quizizz) dikombinasikan dengan keterbacaan teks pengetikan ultra-presisi (ala Monkeytype).
- **Nuansa Warna:** Vibrant, ceria, bersahabat untuk siswa, dengan kontras tinggi agar tidak melelahkan mata.

## 2. Palet Warna (Color Palette)

### Brand & Role Tokens
- **Primary / Action:** `#6366F1` (Indigo 500) | Hover: `#4F46E5` (Indigo 600)
- **Secondary / Accent:** `#F59E0B` (Amber/Yellow 500) | Hover: `#D97706` (Amber 600)
- **Success / Correct Key:** `#10B981` (Emerald 500) | Background: `#ECFDF5`
- **Error / Wrong Key:** `#EF4444` (Coral Red 500) | Background: `#FEF2F2`
- **Info / Host Room:** `#8B5CF6` (Purple 500)
- **Podium Gold (1st):** `#FBBF24` (Gold 400)
- **Podium Silver (2nd):** `#94A3B8` (Slate 400)
- **Podium Bronze (3rd):** `#F97316` (Orange 500)

### Background & Surface
- **App Canvas Background:** `#0F172A` (Slate 900 - Modern Dark Gamified)
- **Card / Surface Card:** `#1E293B` (Slate 800)
- **Surface Hover:** `#334155` (Slate 700)
- **Border Default:** `#334155` (Slate 700)
- **Text Main:** `#F8FAFC` (Slate 50)
- **Text Muted:** `#94A3B8` (Slate 400)

### Typing Tokens (Monkeytype Inspired)
- **Untyped Character:** `#64748B` (Slate 500)
- **Correct Character:** `#F8FAFC` (Slate 50 - Bright White)
- **Incorrect Character:** `#EF4444` (Red 500) dengan latar samar `#7F1D1D40`
- **Active Caret / Cursor:** `#F59E0B` (Amber Glow with smooth transit)

## 3. Tipografi (Typography)
- **UI / Headings / Buttons:** System Sans / Inter / Plus Jakarta Sans (`font-sans`)
- **Typing Area & Code:** `font-mono` (JetBrains Mono, Fira Code, Courier New)
  - Text Size saat Mengetik: `text-2xl` hingga `text-3xl` dengan `leading-relaxed` dan `tracking-wide` agar nyaman dibaca.

## 4. Spacing & Borders
- **Border Radius:**
  - Card & Modal: `rounded-2xl`
  - Button & Input: `rounded-xl`
  - Keys pada Virtual Keyboard: `rounded-lg`
- **Shadows:** Soft glow shadows (`shadow-lg`, `shadow-indigo-500/20`)

## 5. Komponen Kunci (Do's & Don'ts)
- **DO:**
  - Gunakan font monospace konsisten untuk area pengetikan teks maupun kode.
  - Tampilkan avatar animasi lucu untuk siswa (hewan/robot/emoji gamified).
  - Berikan feedback haptic/visual langsung saat tuts keyboard ditekan.
- **DON'T:**
  - Jangan gunakan inline style statis; manfaatkan utility Tailwind CSS.
  - Jangan tampilkan keyboard virtual di dalam layar kompetisi Live Room agar tidak mendistraksi siswa.
