'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { StatsCard } from '@/components/admin/stats-card';
import { ChartCard, SimpleBarChart } from '@/components/admin/chart-card';
import { Globe, Users, BarChart3, Activity } from 'lucide-react';

interface ChartData {
  label: string;
  value: number;
}

interface AnalyticsData {
  traffic?: {
    totalUsers: number;
    usersToday: number;
    totalProgress: number;
  };
  users?: {
    registrationData: ChartData[];
  };
  quiz?: {
    scoreBins: ChartData[];
  };
}

export default function TrafficAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const traffic = data.traffic;
  const registrationData = data.users?.registrationData || [];
  const activityData = [
    { label: 'Belajar', value: traffic?.totalProgress ?? 0, color: 'var(--color-accent)' },
    { label: 'Pengguna', value: traffic?.totalUsers ?? 0, color: 'var(--color-blue)' },
    { label: 'Aktif Hari Ini', value: traffic?.usersToday ?? 0, color: 'var(--color-green)' },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Lalu Lintas Website" description="Overview traffic dan engagement pengguna" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Pengguna" value={traffic?.totalUsers ?? 0} icon={Globe} color="accent" loading={loading} />
        <StatsCard title="Aktivitas Belajar" value={traffic?.totalProgress ?? 0} icon={Activity} color="blue" loading={loading} />
        <StatsCard title="Pengguna Baru Hari Ini" value={traffic?.usersToday ?? 0} icon={Users} color="green" loading={loading} />
        <StatsCard title="Sesi Aktif" value={traffic?.usersToday ?? 0} icon={BarChart3} color="yellow" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Pendaftaran per Bulan" subtitle="Pertumbuhan pengguna (6 bulan terakhir)">
          {registrationData.length > 0 ? (
            <SimpleBarChart data={registrationData} />
          ) : (
            <div className="text-center py-12 text-muted text-sm">
              Belum ada data pendaftaran
            </div>
          )}
        </ChartCard>

        <ChartCard title="Engagement Overview" subtitle="Ringkasan aktivitas platform">
          <SimpleBarChart data={activityData} />
        </ChartCard>
      </div>
    </div>
  );
}