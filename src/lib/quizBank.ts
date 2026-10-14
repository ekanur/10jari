import { QuizItem } from '@/types';

export const DEFAULT_QUIZ_BANK: QuizItem[] = [
  // --- 10 JARI: HOME ROW ---
  {
    id: 'hr-1',
    title: 'Home Row Dasar (ASDF JKL;)',
    category: 'home-row',
    language: 'id',
    difficulty: 'beginner',
    text: 'asdf jkl; asdf jkl; fads jads klas lada jala fasal fajar salak salsa daska',
  },
  {
    id: 'hr-2',
    title: 'Home Row & Jari Telunjuk (G & H)',
    category: 'home-row',
    language: 'id',
    difficulty: 'beginner',
    text: 'gajah gagah halah salah galah hafal jatah gajah gagah jajah dahlia gajah hafal',
  },
  {
    id: 'hr-en-1',
    title: 'Home Row English Basics',
    category: 'home-row',
    language: 'en',
    difficulty: 'beginner',
    text: 'flask salad flash shall glass flash fall hall glad slash flask salad glass',
  },

  // --- 10 JARI: TOP ROW ---
  {
    id: 'tr-1',
    title: 'Top Row Huruf QWERTY UIOP',
    category: 'top-row',
    language: 'id',
    difficulty: 'beginner',
    text: 'topi roti telur pintu putri pergi koper waktu rapat petir wujud tepi repot terigu',
  },
  {
    id: 'tr-en-1',
    title: 'Top Row English Words',
    category: 'top-row',
    language: 'en',
    difficulty: 'beginner',
    text: 'quiet power write route queue tower worry water prioritize territory pointer',
  },

  // --- 10 JARI: BOTTOM ROW ---
  {
    id: 'br-1',
    title: 'Bottom Row Huruf ZXCVB NM',
    category: 'bottom-row',
    language: 'id',
    difficulty: 'beginner',
    text: 'zaman mobil baca nama kaca warna meja catur banjar zaman ziarah malam baru',
  },
  {
    id: 'br-en-1',
    title: 'Bottom Row English Words',
    category: 'bottom-row',
    language: 'en',
    difficulty: 'beginner',
    text: 'zebra cabin venom match black zoom civic marble examine breeze bronze',
  },

  // --- 10 JARI: NUMBER ROW & SYMBOLS ---
  {
    id: 'num-1',
    title: 'Angka 1 sampai 0 Baris Atas',
    category: 'numbers',
    language: 'id',
    difficulty: 'intermediate',
    text: '123 456 789 012 345 678 901 2024 2025 2026 10 20 30 40 50 60 70 80 90 100',
  },
  {
    id: 'num-2',
    title: 'Kombinasi Kata dan Angka (Indonesia)',
    category: 'numbers',
    language: 'id',
    difficulty: 'intermediate',
    text: 'kelas 10 nomor 45 tahun 2026 harga 75000 diskon 15 persen kamar 302 lantai 4',
  },
  {
    id: 'num-en-1',
    title: 'Numbers and Alphanumeric (English)',
    category: 'numbers',
    language: 'en',
    difficulty: 'intermediate',
    text: 'room 104 flight 789 year 2026 code 54321 level 12 score 9870 item 45 of 99',
  },

  // --- KALIMAT EDUKASI & KUTIPAN BILINGUAL ---
  {
    id: 'sent-id-1',
    title: 'Kutipan Motivasi Belajar (Indonesia)',
    category: 'sentences-id',
    language: 'id',
    difficulty: 'intermediate',
    text: 'Mengetik dengan sepuluh jari membutuhkan konsistensi dan latihan berulang setiap hari. Kecepatan akan datang seiring dengan tingginya akurasi jari kita.',
  },
  {
    id: 'sent-id-2',
    title: 'Literasi Digital & Teknologi (Indonesia)',
    category: 'sentences-id',
    language: 'id',
    difficulty: 'intermediate',
    text: 'Keterampilan mengetik cepat tanpa melihat keyboard adalah aset berharga dalam era kecerdasan buatan dan dunia kerja modern.',
  },
  {
    id: 'sent-en-1',
    title: 'Education & Typing Growth (English)',
    category: 'sentences-en',
    language: 'en',
    difficulty: 'intermediate',
    text: 'Consistency is the foundation of high typing speed. Focus on accuracy first, and muscle memory will naturally accelerate your keystrokes.',
  },
  {
    id: 'sent-en-2',
    title: 'Technology & Future (English)',
    category: 'sentences-en',
    language: 'en',
    difficulty: 'intermediate',
    text: 'Mastering touch typing allows your thoughts to flow effortlessly into digital reality without the friction of hunting for keys.',
  },

  // --- KODE PEMROGRAMAN (PROGRAMMING CODE TYPING) ---
  {
    id: 'code-js-1',
    title: 'JavaScript: Function & Array Filter',
    category: 'code-js',
    language: 'code',
    difficulty: 'advanced',
    isCode: true,
    text: 'const filterScores = (scores, min) => scores.filter(s => s >= min);',
  },
  {
    id: 'code-js-2',
    title: 'JavaScript: Async Fetch Handler',
    category: 'code-js',
    language: 'code',
    difficulty: 'advanced',
    isCode: true,
    text: 'async function fetchStudents(roomId) {\n  const res = await api.get(`/rooms/${roomId}`);\n  return res.data;\n}',
  },
  {
    id: 'code-html-1',
    title: 'HTML: Card Element Structure',
    category: 'code-html',
    language: 'code',
    difficulty: 'intermediate',
    isCode: true,
    text: '<div class="card p-4 rounded-xl shadow-md">\n  <h2 class="text-xl font-bold">Juara Kuis</h2>\n  <p>Selamat kepada seluruh peserta!</p>\n</div>',
  },
  {
    id: 'code-py-1',
    title: 'Python: List Comprehension & Dict',
    category: 'code-py',
    language: 'code',
    difficulty: 'advanced',
    isCode: true,
    text: 'def calculate_wpm(chars, minutes):\n    if minutes <= 0:\n        return 0\n    return round((chars / 5) / minutes)',
  },
];

// Helper LocalStorage untuk Guru menyimpan paket kuis custom
const STORAGE_KEY_CUSTOM_QUIZZES = 'typearena_custom_quizzes';

export function getCustomQuizzes(): QuizItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_QUIZZES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse custom quizzes:', e);
    return [];
  }
}

export function saveCustomQuiz(quiz: Omit<QuizItem, 'id'>): QuizItem {
  const customQuizzes = getCustomQuizzes();
  const newQuiz: QuizItem = {
    ...quiz,
    id: `custom-${Date.now()}`,
  };
  customQuizzes.unshift(newQuiz);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_CUSTOM_QUIZZES, JSON.stringify(customQuizzes));
  }
  return newQuiz;
}

export function deleteCustomQuiz(id: string): void {
  const customQuizzes = getCustomQuizzes().filter(q => q.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_CUSTOM_QUIZZES, JSON.stringify(customQuizzes));
  }
}

export function getAllQuizzes(): QuizItem[] {
  return [...getCustomQuizzes(), ...DEFAULT_QUIZ_BANK];
}
