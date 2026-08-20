'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { StatsCard } from '@/components/admin/stats-card';
import { ChartCard, SimpleBarChart } from '@/components/admin/chart-card';
import { ClipboardList, CheckCircle, XCircle, BarChart3 } from 'lucide-react';

interface ChartData {
  label: string;
  value: number;
}

interface AnalyticsData {
  quiz?: {
    totalQuestions: number;
    totalReflection: number;
    totalAttempted: number;
    lulus: number;
    gagal: number;
    scoreBins: ChartData[];
  };
}

export default function QuizAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const quiz = data.quiz;
  const attempted = quiz?.totalAttempted ?? 0;
  const lulusRate =
    attempted > 0 ? Math.round((((quiz?.lulus ?? 0) / attempted) * 100) * 10) / 10 : 0;
  const scoreBins = quiz?.scoreBins || [];

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Statistik Quiz" description="Analisis performa quiz siswa" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Soal Quiz" value={quiz?.totalQuestions ?? 0} icon={ClipboardList} color="accent" loading={loading} />
        <StatsCard title="Tingkat Kelulusan" value={`${lulusRate}%`} icon={CheckCircle} color="green" loading={loading} />
        <StatsCard title="Soal Refleksi" value={quiz?.totalReflection ?? 0} icon={BarChart3} color="blue" loading={loading} />
        <StatsCard title="Belum Lulus" value={quiz?.gagal ?? 0} icon={XCircle} color="red" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Distribusi Nilai" subtitle="Histogram nilai siswa">
          {scoreBins.length > 0 ? (
            <SimpleBarChart data={scoreBins} />
          ) : (
            <div className="text-center py-12 text-muted text-sm">
              Belum ada data pengerjaan quiz
            </div>
          )}
        </ChartCard>

        <ChartCard title="Hasil Quiz" subtitle="Status kelulusan siswa">
          <SimpleBarChart
            data={[
              { label: 'Lulus', value: quiz?.lulus ?? 0, color: 'var(--color-green)' },
              { label: 'Tidak Lulus', value: quiz?.gagal ?? 0, color: 'var(--color-red)' },
            ]}
          />
        </ChartCard>
      </div>
    </div>
  );
}