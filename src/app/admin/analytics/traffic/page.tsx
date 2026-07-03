'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { StatsCard } from '@/components/admin/stats-card';
import { ChartCard, SimpleBarChart, Sparkline } from '@/components/admin/chart-card';
import { Globe, Eye, Clock, Smartphone } from 'lucide-react';

export default function TrafficAnalyticsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Lalu Lintas Website" description="Overview traffic dan engagement pengunjung" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Kunjungan" value={0} icon={Globe} color="accent" trend={{ value: 0, label: 'minggu ini' }} />
        <StatsCard title="Page Views" value={0} icon={Eye} color="blue" />
        <StatsCard title="Rata-rata Durasi" value="0 mnt" icon={Clock} color="green" />
        <StatsCard title="Bounce Rate" value="0%" icon={Smartphone} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Kunjungan Harian" subtitle="7 hari terakhir">
          <div className="text-center py-12 text-muted text-sm">
            Data akan tersedia seiring penggunaan platform
          </div>
        </ChartCard>

        <ChartCard title="Sumber Traffic" subtitle="Dari mana pengunjung berasal">
          <div className="text-center py-12 text-muted text-sm">
            Data akan tersedia seiring penggunaan platform
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Halaman Terpopuler" subtitle="Berdasarkan jumlah kunjungan">
          <div className="text-center py-12 text-muted text-sm">
            Data akan tersedia seiring penggunaan platform
          </div>
        </ChartCard>

        <ChartCard title="Device Breakdown" subtitle="Jenis perangkat pengunjung">
          <div className="text-center py-12 text-muted text-sm">
            Data akan tersedia seiring penggunaan platform
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
