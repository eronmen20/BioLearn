'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { StatsCard } from '@/components/admin/stats-card';
import { ChartCard, SimpleBarChart, Sparkline } from '@/components/admin/chart-card';
import { Coins, Zap, Clock, TrendingUp } from 'lucide-react';

export default function AIUsagePage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Statistik Penggunaan AI" description="Monitor penggunaan token dan biaya AI" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Token" value={0} icon={Coins} color="accent" />
        <StatsCard title="Total Request" value={0} icon={Zap} color="blue" />
        <StatsCard title="Estimasi Biaya" value="$0.00" icon={TrendingUp} color="green" />
        <StatsCard title="Rata-rata per Request" value={0} icon={Clock} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Penggunaan Token Harian" subtitle="7 hari terakhir">
          <div className="text-center py-12 text-muted text-sm">
            Data akan tersedia seiring penggunaan platform
          </div>
        </ChartCard>

        <ChartCard title="Penggunaan per Model" subtitle="Distribusi request per AI model">
          <div className="text-center py-12 text-muted text-sm">
            Data akan tersedia seiring penggunaan platform
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Trend Biaya Bulanan" subtitle="Estimasi biaya API per bulan">
        <div className="text-center py-12 text-muted text-sm">
          Data akan tersedia seiring penggunaan platform
        </div>
      </ChartCard>
    </div>
  );
}
