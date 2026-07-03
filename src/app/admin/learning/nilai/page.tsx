'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { StatsCard } from '@/components/admin/stats-card';
import { ChartCard, SimpleBarChart } from '@/components/admin/chart-card';
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

const placeholderData: NilaiRow[] = [];

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
  const [data] = useState<NilaiRow[]>(placeholderData);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Nilai Siswa"
        description="Lihat dan analisis nilai quiz siswa"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Rata-rata Nilai" value={0} icon={Award} color="accent" />
        <StatsCard title="Tertinggi" value={0} icon={TrendingUp} color="green" />
        <StatsCard title="Terendah" value={0} icon={TrendingDown} color="red" />
        <StatsCard title="Total Peserta" value={0} icon={Users} color="blue" />
      </div>

      <ChartCard title="Distribusi Nilai" subtitle="Jumlah siswa per rentang nilai">
        <div className="text-center py-8 text-muted text-sm">
          Data akan tersedia seiring penggunaan platform
        </div>
      </ChartCard>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold text-ink">Daftar Nilai</h3>
        </div>
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Cari siswa atau quiz..."
          emptyMessage="Belum ada data nilai"
        />
      </div>
    </div>
  );
}
