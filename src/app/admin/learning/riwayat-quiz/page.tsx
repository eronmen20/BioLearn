'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { StatsCard } from '@/components/admin/stats-card';
import { ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react';

interface QuizHistoryRow {
  id: number;
  nama: string;
  kelas: string;
  quiz: string;
  skor: number;
  jumlah_soal: number;
  waktu_pengerjaan: string;
  tanggal: string;
}

const placeholderData: QuizHistoryRow[] = [];

const columns: Column<QuizHistoryRow>[] = [
  { key: 'nama', label: 'Nama Siswa', sortable: true },
  { key: 'kelas', label: 'Kelas', sortable: true },
  { key: 'quiz', label: 'Judul Quiz', sortable: true },
  {
    key: 'skor',
    label: 'Skor',
    sortable: true,
    render: (row) => (
      <span className="text-sm font-semibold text-ink">
        {row.skor}/{row.jumlah_soal}
      </span>
    ),
  },
  { key: 'waktu_pengerjaan', label: 'Waktu', sortable: true },
  { key: 'tanggal', label: 'Tanggal', sortable: true },
];

export default function RiwayatQuizPage() {
  const [data] = useState<QuizHistoryRow[]>(placeholderData);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Riwayat Quiz"
        description="Lihat riwayat pengerjaan quiz oleh siswa"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Pengerjaan" value={0} icon={ClipboardList} color="accent" />
        <StatsCard title="Lulus" value={0} icon={CheckCircle} color="green" />
        <StatsCard title="Tidak Lulus" value={0} icon={XCircle} color="red" />
        <StatsCard title="Rata-rata Waktu" value="0 mnt" icon={Clock} color="yellow" />
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold text-ink">Semua Riwayat Quiz</h3>
        </div>
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Cari siswa atau quiz..."
          emptyMessage="Belum ada riwayat quiz"
        />
      </div>
    </div>
  );
}
