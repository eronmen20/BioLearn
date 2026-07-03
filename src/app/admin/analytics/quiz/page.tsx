'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { StatsCard } from '@/components/admin/stats-card';
import { ChartCard, SimpleBarChart } from '@/components/admin/chart-card';
import { ClipboardList, CheckCircle, XCircle, BarChart3 } from 'lucide-react';

export default function QuizAnalyticsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Statistik Quiz" description="Analisis performa quiz siswa" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Quiz" value={0} icon={ClipboardList} color="accent" />
        <StatsCard title="Tingkat Kelulusan" value="0%" icon={CheckCircle} color="green" />
        <StatsCard title="Rata-rata Nilai" value={0} icon={BarChart3} color="blue" />
        <StatsCard title="Gagal" value={0} icon={XCircle} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Nilai Rata-rata per Quiz" subtitle="Perbandingan antar quiz">
          <div className="text-center py-12 text-muted text-sm">
            Data akan tersedia seiring penggunaan platform
          </div>
        </ChartCard>

        <ChartCard title="Distribusi Nilai" subtitle="Histogram nilai siswa">
          <div className="text-center py-12 text-muted text-sm">
            Data akan tersedia seiring penggunaan platform
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Trend Pengerjaan Quiz" subtitle="Jumlah pengerjaan per hari">
        <div className="text-center py-12 text-muted text-sm">
          Data akan tersedia seiring penggunaan platform
        </div>
      </ChartCard>
    </div>
  );
}
