'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { StatsCard } from '@/components/admin/stats-card';
import { Activity, User, FileText, AlertTriangle, Info } from 'lucide-react';

interface ActivityLog {
  id: number;
  timestamp: string;
  user: string;
  aksi: string;
  detail: string;
  ip: string;
  level: 'info' | 'warning' | 'error';
}

const placeholderData: ActivityLog[] = [];

const columns: Column<ActivityLog>[] = [
  { key: 'timestamp', label: 'Waktu', sortable: true },
  { key: 'user', label: 'User', sortable: true },
  { key: 'aksi', label: 'Aksi', sortable: true },
  { key: 'detail', label: 'Detail' },
  { key: 'ip', label: 'IP Address' },
  {
    key: 'level',
    label: 'Level',
    render: (row) => {
      const styles: Record<string, string> = {
        info: 'bg-blue-100 text-blue-700',
        warning: 'bg-yellow-100 text-yellow-700',
        error: 'bg-red-100 text-red-700',
      };
      return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[row.level]}`}>
          {row.level.charAt(0).toUpperCase() + row.level.slice(1)}
        </span>
      );
    },
  },
];

export default function ActivityLogsPage() {
  const [data] = useState<ActivityLog[]>(placeholderData);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Log Aktivitas" description="Riwayat aktivitas seluruh pengguna platform" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Log" value={0} icon={Activity} color="accent" />
        <StatsCard title="Info" value={0} icon={Info} color="blue" />
        <StatsCard title="Warning" value={0} icon={AlertTriangle} color="yellow" />
        <StatsCard title="Error" value={0} icon={AlertTriangle} color="red" />
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold text-ink">Semua Aktivitas</h3>
        </div>
        <DataTable columns={columns as any} data={data as any} searchPlaceholder="Cari log aktivitas..." emptyMessage="Belum ada log aktivitas" />
      </div>
    </div>
  );
}
