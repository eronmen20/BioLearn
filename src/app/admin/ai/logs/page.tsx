'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { StatsCard } from '@/components/admin/stats-card';
import { FileText, Zap, AlertTriangle, Clock } from 'lucide-react';

interface AILogRow {
  id: number;
  timestamp: string;
  user: string;
  prompt_nama: string;
  model: string;
  tokens_in: number;
  tokens_out: number;
  latency_ms: number;
  status: 'success' | 'error';
}

const placeholderData: AILogRow[] = [];

const columns: Column<AILogRow>[] = [
  { key: 'timestamp', label: 'Waktu', sortable: true },
  { key: 'user', label: 'User', sortable: true },
  { key: 'prompt_nama', label: 'Prompt', sortable: true },
  { key: 'model', label: 'Model', sortable: true },
  { key: 'tokens_in', label: 'Token In', sortable: true },
  { key: 'tokens_out', label: 'Token Out', sortable: true },
  { key: 'latency_ms', label: 'Latency', sortable: true, render: (row) => <span className="text-sm">{row.latency_ms}ms</span> },
  {
    key: 'status',
    label: 'Status',
    render: (row) => (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${row.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {row.status === 'success' ? 'Sukses' : 'Error'}
      </span>
    ),
  },
];

export default function AILogsPage() {
  const [data] = useState<AILogRow[]>(placeholderData);

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Log AI" description="Riwayat penggunaan AI assistant" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Request" value={0} icon={FileText} color="accent" />
        <StatsCard title="Sukses" value={0} icon={Zap} color="green" />
        <StatsCard title="Error" value={0} icon={AlertTriangle} color="red" />
        <StatsCard title="Rata-rata Latency" value="0ms" icon={Clock} color="blue" />
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold text-ink">Semua Log</h3>
        </div>
        <DataTable columns={columns as any} data={data as any} searchPlaceholder="Cari log..." emptyMessage="Belum ada log AI" />
      </div>
    </div>
  );
}
