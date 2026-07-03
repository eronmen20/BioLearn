'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { StatsCard } from '@/components/admin/stats-card';
import { ChartCard, SimpleBarChart, Sparkline } from '@/components/admin/chart-card';
import { Users, UserPlus, UserCheck, Activity } from 'lucide-react';

export default function UsersAnalyticsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Statistik Pengguna" description="Analisis data pengguna platform BioLearn" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Pengguna" value={0} icon={Users} color="accent" trend={{ value: 0, label: 'minggu ini' }} />
        <StatsCard title="Pengguna Baru" value={0} icon={UserPlus} color="green" trend={{ value: 0, label: 'hari ini' }} />
        <StatsCard title="Aktif Hari Ini" value={0} icon={UserCheck} color="blue" />
        <StatsCard title="Sesi Aktif" value={0} icon={Activity} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Pendaftaran per Bulan" subtitle="Jumlah pengguna baru">
          <div className="text-center py-12 text-muted text-sm">
            Data akan tersedia seiring penggunaan platform
          </div>
        </ChartCard>

        <ChartCard title="Pengguna Aktif Harian" subtitle="7 hari terakhir">
          <div className="text-center py-12 text-muted text-sm">
            Data akan tersedia seiring penggunaan platform
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Distribusi Role" subtitle="Berdasarkan role pengguna">
          <div className="text-center py-12 text-muted text-sm">
            Data akan tersedia seiring penggunaan platform
          </div>
        </ChartCard>

        <ChartCard title="Distribusi Kelas" subtitle="Berdasarkan kelas siswa">
          <div className="text-center py-12 text-muted text-sm">
            Data akan tersedia seiring penggunaan platform
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
