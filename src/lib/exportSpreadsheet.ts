import * as XLSX from 'xlsx';
import { LiveRoom, PlayerState } from '@/types';

/**
 * Format tanggal Indonesia ramah pengguna
 */
function formatIndonesianDate(timestamp: number): string {
  try {
    const d = new Date(timestamp);
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return new Date(timestamp).toISOString();
  }
}

/**
 * Buat dan unduh berkas rekap spreadsheet (.xlsx atau .csv) untuk guru
 */
export function exportRoomSpreadsheet(room: LiveRoom, fileType: 'xlsx' | 'csv' = 'xlsx'): void {
  if (!room || !room.players) {
    alert('Data room tidak valid atau belum memiliki peserta.');
    return;
  }

  const playersList = Object.values(room.players);
  if (playersList.length === 0) {
    alert('Belum ada siswa yang bergabung ke dalam room.');
    return;
  }

  // Urutkan siswa berdasarkan total skor tertinggi
  const sortedPlayers = [...playersList].sort((a, b) => (b.score || 0) - (a.score || 0));
  const totalRounds = room.rounds.length;

  // Siapkan Baris-Baris Data (Array of Arrays)
  const rows: (string | number)[][] = [];

  // 1. HEADER METADATA TURNAMEN
  rows.push(['REKAP PENILAIAN TURNAMEN MENGETIK 10 JARI - TYPEARENA']);
  rows.push(['']);
  rows.push(['Nama Turnamen / Room', room.title]);
  rows.push(['Kode PIN Room', `#${room.pin}`]);
  rows.push(['Pendidik / Guru Host', room.hostName || 'Guru Kelas']);
  rows.push(['Waktu Pelaksanaan', formatIndonesianDate(room.createdAt || Date.now())]);
  rows.push(['Total Babak Turnamen', `${totalRounds} Babak`]);
  rows.push(['Jumlah Peserta Siswa', `${sortedPlayers.length} Siswa`]);
  rows.push(['']);

  // Rincian Materi Tiap Babak
  rows.push(['DAFTAR MATERI BABAK:']);
  room.rounds.forEach((round, idx) => {
    rows.push([
      `Babak ${idx + 1}`,
      round.title,
      round.category || 'Materi Campuran',
      `${round.text.length} Karakter`,
    ]);
  });
  rows.push(['']);

  // 2. HEADER TABEL HASIL SISWA
  const tableHeaders: string[] = [
    'Peringkat',
    'Nama Siswa',
    'Total Poin',
    'Rata-rata Net WPM',
    'Rata-rata Akurasi (%)',
    'Babak Selesai',
  ];

  for (let r = 0; r < totalRounds; r++) {
    const babakNum = r + 1;
    tableHeaders.push(`Babak ${babakNum} - Net WPM`);
    tableHeaders.push(`Babak ${babakNum} - Akurasi (%)`);
    tableHeaders.push(`Babak ${babakNum} - Progres (%)`);
    tableHeaders.push(`Babak ${babakNum} - Poin`);
  }

  rows.push(tableHeaders);

  // 3. BARIS DATA SISWA
  sortedPlayers.forEach((player: PlayerState, index: number) => {
    const rank = index + 1;
    const history = player.roundHistory || {};
    const historyKeys = Object.keys(history);

    // Hitung rata-rata Net WPM & Akurasi
    let totalWpm = 0;
    let totalAcc = 0;
    let completedCount = 0;

    if (historyKeys.length > 0) {
      historyKeys.forEach((k) => {
        const item = history[Number(k)];
        if (item) {
          totalWpm += item.netWpm || 0;
          totalAcc += item.accuracy || 0;
          if (item.completed) completedCount++;
        }
      });
    } else {
      // Fallback jika hanya 1 babak / belum berganti babak
      totalWpm = player.netWpm || 0;
      totalAcc = player.accuracy || 0;
      if (player.completed) completedCount = 1;
    }

    const divisor = historyKeys.length > 0 ? historyKeys.length : 1;
    const avgWpm = Math.round(totalWpm / divisor);
    const avgAcc = Math.round(totalAcc / divisor);

    const rowData: (string | number)[] = [
      rank,
      player.name,
      player.score || 0,
      avgWpm,
      `${avgAcc}%`,
      `${completedCount} / ${totalRounds} Babak`,
    ];

    // Rincian per babak
    for (let r = 0; r < totalRounds; r++) {
      const roundStat = history[r];
      if (roundStat) {
        rowData.push(roundStat.netWpm || 0);
        rowData.push(`${roundStat.accuracy || 0}%`);
        rowData.push(`${roundStat.progress || 0}%`);
        rowData.push(roundStat.scoreEarned || 0);
      } else if (r === room.currentRoundIndex) {
        // Ronde sedang aktif
        rowData.push(player.netWpm || 0);
        rowData.push(`${player.accuracy || 0}%`);
        rowData.push(`${player.progress || 0}%`);
        rowData.push(player.completed ? Math.round((player.netWpm || 0) * 10 * ((player.accuracy || 100) / 100)) : 0);
      } else {
        // Belum dimainkan
        rowData.push('-');
        rowData.push('-');
        rowData.push('-');
        rowData.push('-');
      }
    }

    rows.push(rowData);
  });

  // Buat WorkBook dan WorkSheet menggunakan SheetJS (xlsx)
  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  // Tentukan lebar kolom agar rapi saat dibuka di Excel
  const colWidths: { wch: number }[] = [
    { wch: 12 }, // Peringkat
    { wch: 24 }, // Nama Siswa
    { wch: 14 }, // Total Poin
    { wch: 18 }, // Rata-rata Net WPM
    { wch: 22 }, // Rata-rata Akurasi
    { wch: 18 }, // Babak Selesai
  ];

  for (let r = 0; r < totalRounds; r++) {
    colWidths.push({ wch: 18 }); // Net WPM
    colWidths.push({ wch: 18 }); // Akurasi
    colWidths.push({ wch: 18 }); // Progres
    colWidths.push({ wch: 16 }); // Poin
  }
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Hasil Siswa');

  // Bersihkan karakter aneh pada nama file
  const sanitizedTitle = room.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `Rekap_Turnamen_${room.pin}_${sanitizedTitle}_${dateStr}.${fileType}`;

  if (fileType === 'csv') {
    XLSX.writeFile(workbook, fileName, { bookType: 'csv' });
  } else {
    XLSX.writeFile(workbook, fileName, { bookType: 'xlsx' });
  }
}
