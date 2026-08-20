'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { StatsCard } from '@/components/admin/stats-card';
import { ChartCard } from '@/components/admin/chart-card';
import { Award, TrendingUp, TrendingDown, Users } from 'lucide-react';

interface NilaiRow {
  id: number;
  nama: string;
  kelas: string;
  quiz: string;
  nilai: number;
  tanggal: string;
  status: string;
}

interface LearningStats {
  nilai?: {
    total: number;
    avg: number;
    highest: number;
    lowest: number;
  };
  progress?: {
    activeStudents: number;
    avgProgress: number;
    completedItems: number;
  };
  riwayat?: {
    total: number;
    lulus: number;
    gagal: number;
  };
}

const columns: Column<NilaiRow>[] = [
  { key: 'nama', label: 'Nama Siswa', sortable: true },
  { key: 'kelas', label: 'Kelas', sortable: true },
  { key: 'quiz', label: 'Quiz', sortable: true },
  {
    key: 'nilai',
    label: 'Nilai',
    sortable: true,
    render: (row) => (
      <span
        className={`text-sm font-bold ${
          row.nilai >= 80 ? 'text-green' : row.nilai >= 60 ? 'text-yellow' : 'text-red'
        }`}
      >
        {row.nilai}
      </span>
    ),
  },
  { key: 'tanggal', label: 'Tanggal', sortable: true },
  {
    key: 'status',
    label: 'Status',
    render: (row) => (
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          row.status === 'Lulus'
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}
      >
        {row.status}
      </span>
    ),
  },
];

export default function NilaiPage() {
  const [data, setData] = useState<NilaiRow[]>([]);
  const [stats, setStats] = useState<LearningStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/learning')
      .then((r) => r.json())
      .then((d) => {
        setData(d.nilai || []);
        setStats(d.stats || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Nilai Siswa"
        description="Lihat dan analisis nilai quiz siswa"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Rata-rata Nilai" value={stats.nilai?.avg ?? 0} icon={Award} color="accent" loading={loading} />
        <StatsCard title="Tertinggi" value={stats.nilai?.highest ?? 0} icon={TrendingUp} color="green" loading={loading} />
        <StatsCard title="Terendah" value={stats.nilai?.lowest ?? 0} icon={TrendingDown} color="red" loading={loading} />
        <StatsCard title="Total Peserta" value={stats.nilai?.total ?? 0} icon={Users} color="blue" loading={loading} />
      </div>

      <ChartCard title="Distribusi Nilai" subtitle="Jumlah siswa per rentang nilai">
        <div className="text-center py-8 text-muted text-sm">
          {data.length > 0
            ? `${data.length} nilai quiz tercatat dari ${new Set(data.map((r) => r.nama)).size} siswa`
            : 'Data akan tersedia seiring penggunaan platform'}
        </div>
      </ChartCard>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold text-ink">Daftar Nilai</h3>
        </div>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchPlaceholder="Cari siswa atau quiz..."
          emptyMessage="Belum ada data nilai"
        />
      </div>
    </div>
  );
}
