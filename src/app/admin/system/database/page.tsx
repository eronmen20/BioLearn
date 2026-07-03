'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { StatsCard } from '@/components/admin/stats-card';
import { ChartCard, SimpleBarChart } from '@/components/admin/chart-card';
import { Database, HardDrive, Table2, RefreshCw, Server, Zap } from 'lucide-react';

export default function DatabaseInfoPage() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Informasi Database"
        description="Status dan statistik database Supabase"
        action={{ label: 'Refresh', onClick: handleRefresh, icon: <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Ukuran Database" value="0 MB" icon={Database} color="accent" />
        <StatsCard title="Total Tabel" value={0} icon={Table2} color="blue" />
        <StatsCard title="Total Baris" value={0} icon={HardDrive} color="green" />
        <StatsCard title="Koneksi Aktif" value={0} icon={Zap} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Ukuran per Tabel" subtitle="Distribusi penyimpanan data">
          <div className="text-center py-12 text-muted text-sm">
            Data akan tersedia seiring penggunaan platform
          </div>
        </ChartCard>

        <ChartCard title="Query Performance" subtitle="Rata-rata waktu eksekusi">
          <div className="text-center py-12 text-muted text-sm">
            Data akan tersedia seiring penggunaan platform
          </div>
        </ChartCard>
      </div>

      <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Server className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-ink">Detail Koneksi</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Provider', value: 'Supabase' },
            { label: 'Region', value: 'Southeast Asia' },
            { label: 'PostgreSQL Version', value: '15.x' },
            { label: 'Status', value: 'Connected' },
            { label: 'SSL', value: 'Enabled' },
            { label: 'Pooling', value: 'PgBouncer' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 bg-bg-alt rounded-xl">
              <span className="text-xs text-muted">{item.label}</span>
              <span className="text-sm font-semibold text-ink">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-ink mb-4">Daftar Tabel</h3>
        <div className="text-center py-8 text-muted text-sm">
          Informasi tabel akan dimuat dari Supabase secara otomatis
        </div>
      </div>
    </div>
  );
}
