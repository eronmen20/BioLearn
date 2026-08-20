'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { StatsCard } from '@/components/admin/stats-card';
import { ChartCard } from '@/components/admin/chart-card';
import { GraduationCap, TrendingUp, BookOpen, Clock } from 'lucide-react';

interface ProgressRow {
  id: number;
  nama: string;
  kelas: string;
  materi: string;
  progress: number;
  terakhir_akses: string;
  status: string;
}

interface LearningStats {
  nilai?: { total: number; avg: number; highest: number; lowest: number };
  progress?: { activeStudents: number; avgProgress: number; completedItems: number };
  riwayat?: { total: number; lulus: number; gagal: number };
}

const columns: Column<ProgressRow>[] = [
  { key: 'nama', label: 'Nama Siswa', sortable: true },
  { key: 'kelas', label: 'Kelas', sortable: true },
  { key: 'materi', label: 'Materi', sortable: true },
  {
    key: 'progress',
    label: 'Progress',
    sortable: true,
    render: (row) => (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-border-light rounded-full overflow-hidden max-w-[120px]">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${Math.max(0, Math.min(100, row.progress))}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-ink">{row.progress}%</span>
      </div>
    ),
  },
  { key: 'terakhir_akses', label: 'Terakhir Diakses', sortable: true },
  {
    key: 'status',
    label: 'Status',
    render: (row) => (
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          row.status === 'Selesai'
            ? 'bg-green-100 text-green-700'
            : row.status === 'Sedang Belajar'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}
      >
        {row.status}
      </span>
    ),
  },
];

export default function ProgressBelajarPage() {
  const [data, setData] = useState<ProgressRow[]>([]);
  const [stats, setStats] = useState<LearningStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/learning')
      .then((r) => r.json())
      .then((d) => {
        setData(d.progress || []);
        setStats(d.stats || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Progress Belajar"
        description="Pantau progress belajar siswa secara real-time"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Siswa Aktif" value={stats.progress?.activeStudents ?? 0} icon={GraduationCap} color="accent" loading={loading} />
        <StatsCard title="Rata-rata Progress" value={`${stats.progress?.avgProgress ?? 0}%`} icon={TrendingUp} color="green" loading={loading} />
        <StatsCard title="Materi Diselesaikan" value={stats.progress?.completedItems ?? 0} icon={BookOpen} color="blue" loading={loading} />
        <StatsCard title="Total Progress Records" value={data.length} icon={Clock} color="yellow" loading={loading} />
      </div>

      <ChartCard title="Progress per Materi" subtitle="Rata-rata persentase penyelesaian">
        <div className="text-center py-8 text-muted text-sm">
          {data.length > 0
            ? `${new Set(data.map((r) => r.nama)).size} siswa aktif, rata-rata ${stats.progress?.avgProgress ?? 0}%`
            : 'Data akan tersedia seiring penggunaan platform'}
        </div>
      </ChartCard>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold text-ink">Detail Progress Siswa</h3>
        </div>
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchPlaceholder="Cari siswa..."
          emptyMessage="Belum ada data progress siswa"
        />
      </div>
    </div>
  );
}
