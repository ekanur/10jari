'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveCustomQuiz } from '@/lib/quizBank';
import { QuizCategory } from '@/types';
import { Code2, BookOpen, Save, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function TeacherEditorPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isCode, setIsCode] = useState(false);
  const [language, setLanguage] = useState<'id' | 'en' | 'code'>('id');
  const [category, setCategory] = useState<QuizCategory>('custom');
  const [error, setError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Judul materi harus diisi.');
      return;
    }
    if (!text.trim() || text.length < 5) {
      setError('Teks materi pengetikan minimal 5 karakter.');
      return;
    }

    saveCustomQuiz({
      title: title.trim(),
      text: text.trim(),
      isCode,
      language: isCode ? 'code' : language,
      category,
      difficulty: isCode ? 'advanced' : 'intermediate',
    });

    router.push('/teacher');
  };

  // Template cepat
  const insertTemplate = (type: 'js' | 'python' | 'html' | 'id' | 'en') => {
    if (type === 'js') {
      setTitle('JavaScript: Array Map & Arrow Function');
      setText('const doubleValues = numbers.map(n => n * 2);\nconsole.log(doubleValues);');
      setIsCode(true);
      setLanguage('code');
      setCategory('code-js');
    } else if (type === 'python') {
      setTitle('Python: Fungsi Hitung Faktorial');
      setText('def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)');
      setIsCode(true);
      setLanguage('code');
      setCategory('code-py');
    } else if (type === 'html') {
      setTitle('HTML: Formulir Login Sederhana');
      setText('<form action="/login" method="POST">\n  <input type="text" name="user" required />\n  <button type="submit">Masuk</button>\n</form>');
      setIsCode(true);
      setLanguage('code');
      setCategory('code-html');
    } else if (type === 'id') {
      setTitle('Bahasa Indonesia: Literasi Digital SMK');
      setText('Kecepatan mengetik sepuluh jari sangat menunjang produktivitas siswa jurusan rekayasa perangkat lunak dalam menyusun baris kode program.');
      setIsCode(false);
      setLanguage('id');
      setCategory('sentences-id');
    } else if (type === 'en') {
      setTitle('English: Software Engineering Practice');
      setText('Clean code always looks like it was written by someone who cares. Simple design and high typing accuracy prevent frequent bugs.');
      setIsCode(false);
      setLanguage('en');
      setCategory('sentences-en');
    }
  };

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/teacher"
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white">Buat Materi / Kuis Baru</h1>
          <p className="text-slate-400 text-xs">
            Input teks bebas atau potongan kode pemrograman untuk sesi latihan dan live room.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Quick Template Buttons */}
      <div className="p-4 mb-6 rounded-2xl bg-slate-900/80 border border-slate-800">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Gunakan Contoh Template Cepat:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => insertTemplate('js')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 text-xs font-mono font-medium"
          >
            JS Function
          </button>
          <button
            type="button"
            onClick={() => insertTemplate('python')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-mono font-medium"
          >
            Python Code
          </button>
          <button
            type="button"
            onClick={() => insertTemplate('html')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-orange-400 border border-slate-700 text-xs font-mono font-medium"
          >
            HTML Form
          </button>
          <button
            type="button"
            onClick={() => insertTemplate('id')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 text-xs font-medium"
          >
            Paragraf Indonesia
          </button>
          <button
            type="button"
            onClick={() => insertTemplate('en')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 border border-slate-700 text-xs font-medium"
          >
            Paragraf English
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="flex flex-col gap-5 p-6 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Judul Soal / Materi
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Latihan Sintaks JavaScript Dasar"
            className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Tipe Konten
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsCode(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  !isCode
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                    : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Teks Biasa
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsCode(true);
                  setLanguage('code');
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  isCode
                    ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/30'
                    : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Code2 className="w-4 h-4" /> Kode Program
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Bahasa
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              disabled={isCode}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm disabled:opacity-50"
            >
              <option value="id">Bahasa Indonesia</option>
              <option value="en">Bahasa Inggris (English)</option>
              <option value="code">Kode Pemrograman</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Teks / Kode yang Harus Diketik Siswa</span>
            <span className="font-mono text-slate-500 font-normal">{text.length} Karakter</span>
          </label>
          <textarea
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              isCode
                ? 'function calculateScore() {\n  return 100;\n}'
                : 'Ketikkan teks materi yang akan diketik siswa di sini...'
            }
            className={`w-full p-4 rounded-xl bg-slate-950/90 border border-slate-700/80 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm leading-relaxed ${
              isCode ? 'font-mono text-cyan-300' : 'font-sans'
            }`}
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.01]"
        >
          <Save className="w-4 h-4" />
          Simpan ke Bank Soal Guru
        </button>
      </form>
    </div>
  );
}
