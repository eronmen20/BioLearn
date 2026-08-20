'use client';

import { useState, useEffect } from 'react';
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

interface LearningStats {
  nilai?: { total: number; avg: number; highest: number; lowest: number };
  progress?: { activeStudents: number; avgProgress: number; completedItems: number };
  riwayat?: { total: number; lulus: number; gagal: number };
}

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
  const [data, setData] = useState<QuizHistoryRow[]>([]);
  const [stats, setStats] = useState<LearningStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/learning')
      .then((r) => r.json())
      .then((d) => {
        setData(d.riwayat || []);
        setStats(d.stats || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Riwayat Quiz"
        description="Lihat riwayat pengerjaan quiz oleh siswa"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Pengerjaan" value={stats.riwayat?.total ?? 0} icon={ClipboardList} color="accent" loading={loading} />
        <StatsCard title="Lulus" value={stats.riwayat?.lulus ?? 0} icon={CheckCircle} color="green" loading={loading} />
        <StatsCard title="Tidak Lulus" value={stats.riwayat?.gagal ?? 0} icon={XCircle} color="red" loading={loading} />
        <StatsCard title="Siswa Terlibat" value={new Set(data.map((r) => r.nama)).size} icon={Clock} color="yellow" loading={loading} />
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold text-ink">Semua Riwayat Quiz</h3>
        </div>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchPlaceholder="Cari siswa atau quiz..."
          emptyMessage="Belum ada riwayat quiz"
        />
      </div>
    </div>
  );
}
