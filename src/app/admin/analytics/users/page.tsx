'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { StatsCard } from '@/components/admin/stats-card';
import { ChartCard, SimpleBarChart, Sparkline } from '@/components/admin/chart-card';
import { Users, UserPlus, UserCheck, UserCog } from 'lucide-react';

interface ChartData {
  label: string;
  value: number;
}

interface AnalyticsData {
  users?: {
    total: number;
    siswa: number;
    guru: number;
    admin: number;
    today: number;
    registrationData: ChartData[];
    roleDistribution: ChartData[];
  };
}

export default function UsersAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const users = data.users;
  const registrationData = users?.registrationData || [];
  const roleDist = users?.roleDistribution || [];

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Statistik Pengguna" description="Analisis data pengguna platform BioLearn" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Pengguna" value={users?.total ?? 0} icon={Users} color="accent" loading={loading} />
        <StatsCard title="Siswa" value={users?.siswa ?? 0} icon={UserPlus} color="green" loading={loading} />
        <StatsCard title="Guru" value={users?.guru ?? 0} icon={UserCheck} color="blue" loading={loading} />
        <StatsCard title="Admin" value={users?.admin ?? 0} icon={UserCog} color="yellow" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Pendaftaran per Bulan" subtitle="Jumlah pengguna baru (6 bulan terakhir)">
          {registrationData.length > 0 ? (
            <SimpleBarChart data={registrationData} />
          ) : (
            <div className="text-center py-12 text-muted text-sm">
              Belum ada data pendaftaran
            </div>
          )}
        </ChartCard>

        <ChartCard title="Distribusi Role" subtitle="Berdasarkan role pengguna">
          {roleDist.length > 0 ? (
            <SimpleBarChart data={roleDist} />
          ) : (
            <div className="text-center py-12 text-muted text-sm">
              Belum ada data pengguna
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}