'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { StatsCard } from '@/components/admin/stats-card';
import { ChartCard, SimpleBarChart } from '@/components/admin/chart-card';
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

const placeholderData: ProgressRow[] = [];

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
            style={{ width: `${row.progress}%` }}
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
  const [data] = useState<ProgressRow[]>(placeholderData);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Progress Belajar"
        description="Pantau progress belajar siswa secara real-time"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Siswa Aktif" value={0} icon={GraduationCap} color="accent" />
        <StatsCard title="Rata-rata Progress" value="0%" icon={TrendingUp} color="green" />
        <StatsCard title="Materi Diselesaikan" value={0} icon={BookOpen} color="blue" />
        <StatsCard title="Waktu Belajar Hari Ini" value="0 jam" icon={Clock} color="yellow" />
      </div>

      <ChartCard title="Progress per Materi" subtitle="Rata-rata persentase penyelesaian">
        <div className="text-center py-8 text-muted text-sm">
          Data akan tersedia seiring penggunaan platform
        </div>
      </ChartCard>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold text-ink">Detail Progress Siswa</h3>
        </div>
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Cari siswa..."
          emptyMessage="Belum ada data progress siswa"
        />
      </div>
    </div>
  );
}
