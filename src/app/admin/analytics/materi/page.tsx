'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { StatsCard } from '@/components/admin/stats-card';
import { ChartCard, SimpleBarChart } from '@/components/admin/chart-card';
import { BookOpen, ListTree, Eye, TrendingUp } from 'lucide-react';
import { adminFetch } from "@/lib/admin-fetch";

interface ChartData {
  label: string;
  value: number;
}

interface AnalyticsData {
  materi?: {
    totalMateri: number;
    totalBab: number;
    totalProgress: number;
    materiProgress: ChartData[];
  };
}

export default function MateriAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const materi = data.materi;
  const materiProgress = materi?.materiProgress || [];

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Statistik Materi" description="Analisis konten pembelajaran" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Materi" value={materi?.totalMateri ?? 0} icon={BookOpen} color="accent" loading={loading} />
        <StatsCard title="Total Bab" value={materi?.totalBab ?? 0} icon={ListTree} color="blue" loading={loading} />
        <StatsCard title="Total Dikerjakan" value={materi?.totalProgress ?? 0} icon={Eye} color="green" loading={loading} />
        <StatsCard title="Materi dengan Progress" value={materiProgress.length} icon={TrendingUp} color="yellow" loading={loading} />
      </div>

      <ChartCard title="Rata-rata Progress per Bab" subtitle="Persentase penyelesaian tiap bab">
        {materiProgress.length > 0 ? (
          <SimpleBarChart data={materiProgress} />
        ) : (
          <div className="text-center py-12 text-muted text-sm">
            Belum ada aktivitas belajar pada materi
          </div>
        )}
      </ChartCard>
    </div>
  );
}