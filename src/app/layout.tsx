import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/ui/Navbar';

export const metadata: Metadata = {
  title: 'TypeArena - Latihan Mengetik 10 Jari & Live Quiz Sekolah',
  description: 'Aplikasi edukasi latihan mengetik 10 jari dengan visual keyboard interaktif dan kompetisi live room multi-round.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
