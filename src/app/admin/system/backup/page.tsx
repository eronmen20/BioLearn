'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { StatsCard } from '@/components/admin/stats-card';
import { Database, Download, Upload, RefreshCw, HardDrive, Clock, CheckCircle } from 'lucide-react';

interface BackupRecord {
  id: number;
  filename: string;
  ukuran: string;
  tipe: string;
  status: 'success' | 'failed' | 'in_progress';
  created_at: string;
}

const placeholderData: BackupRecord[] = [];

const columns: Column<BackupRecord>[] = [
  { key: 'filename', label: 'Nama File', sortable: true },
  { key: 'ukuran', label: 'Ukuran', sortable: true },
  { key: 'tipe', label: 'Tipe', sortable: true },
  {
    key: 'status',
    label: 'Status',
    render: (row) => {
      const styles: Record<string, string> = {
        success: 'bg-green-100 text-green-700',
        failed: 'bg-red-100 text-red-700',
        in_progress: 'bg-blue-100 text-blue-700',
      };
      const labels: Record<string, string> = { success: 'Berhasil', failed: 'Gagal', in_progress: 'Proses' };
      return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[row.status]}`}>{labels[row.status]}</span>;
    },
  },
  { key: 'created_at', label: 'Tanggal', sortable: true },
];

export default function BackupPage() {
  const [data] = useState<BackupRecord[]>(placeholderData);
  const [backing, setBacking] = useState(false);

  const handleBackup = () => {
    setBacking(true);
    setTimeout(() => setBacking(false), 2000);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Manajemen Backup"
        description="Kelola backup dan restore data platform"
        action={{ label: 'Buat Backup', onClick: handleBackup, icon: <Download className="w-4 h-4" /> }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Backup" value={0} icon={Database} color="accent" />
        <StatsCard title="Backup Terakhir" value="-" icon={Clock} color="blue" />
        <StatsCard title="Total Ukuran" value="0 MB" icon={HardDrive} color="yellow" />
        <StatsCard title="Berhasil" value={0} icon={CheckCircle} color="green" />
      </div>

      {backing && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-blue animate-spin" />
          <span className="text-sm text-blue-700 font-medium">Sedang membuat backup...</span>
        </div>
      )}

      <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
        <h3 className="text-sm font-semibold text-ink">Restore Backup</h3>
        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
          <Upload className="w-8 h-8 text-muted mx-auto mb-2" />
          <p className="text-sm text-muted">Drag & drop file backup (.sql atau .json)</p>
          <p className="text-xs text-muted mt-1">Atau klik untuk memilih file</p>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold text-ink">Riwayat Backup</h3>
        </div>
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Cari backup..."
          emptyMessage="Belum ada backup. Klik &quot;Buat Backup&quot; untuk memulai."
          actions={(row) => (
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-bg-alt transition-colors">
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          )}
        />
      </div>
    </div>
  );
}
