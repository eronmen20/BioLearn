'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { StatsCard } from '@/components/admin/stats-card';
import { ChartCard, SimpleBarChart } from '@/components/admin/chart-card';
import { BookOpen, FileText, Eye, TrendingUp } from 'lucide-react';

export default function MateriAnalyticsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Statistik Materi" description="Analisis konten pembelajaran" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Materi" value={0} icon={BookOpen} color="accent" />
        <StatsCard title="Total Halaman" value={0} icon={FileText} color="blue" />
        <StatsCard title="Total Dilihat" value={0} icon={Eye} color="green" />
        <StatsCard title="Rata-rata per Hari" value={0} icon={TrendingUp} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Materi Terpopuler" subtitle="Berdasarkan jumlah dilihat">
          <div className="text-center py-12 text-muted text-sm">
            Data akan tersedia seiring penggunaan platform
          </div>
        </ChartCard>

        <ChartCard title="Distribusi per Bab" subtitle="Jumlah materi per bab">
          <div className="text-center py-12 text-muted text-sm">
            Data akan tersedia seiring penggunaan platform
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Trend Akses Materi" subtitle="30 hari terakhir">
        <div className="text-center py-12 text-muted text-sm">
          Data akan tersedia seiring penggunaan platform
        </div>
      </ChartCard>
    </div>
  );
}
