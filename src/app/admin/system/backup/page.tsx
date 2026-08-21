'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { StatsCard } from '@/components/admin/stats-card';
import { adminFetch } from '@/lib/admin-fetch';
import { showToast } from '@/components/ui/toaster';
import { Database, Download, Upload, RefreshCw, HardDrive, Clock, CheckCircle, FileJson } from 'lucide-react';

interface StatsResponse {
  stats: {
    totalUsers: number;
    totalSiswa: number;
    totalAdmin: number;
    totalProgress: number;
    usersToday: number;
    totalMateri: number;
    totalQuiz: number;
    totalFlashcard: number;
    totalPraktikum: number;
    totalReflection: number;
  };
}

interface BackupData {
  version: string;
  exported_at: string;
  tables: Record<string, unknown[]>;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function BackupPage() {
  const [stats, setStats] = useState<StatsResponse['stats'] | null>(null);
  const [backup, setBackup] = useState<BackupData | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingBackup, setLoadingBackup] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoadingStats(true);
    try {
      const res = await adminFetch('/api/admin/stats');
      if (!res.ok) throw new Error('Gagal memuat statistik');
      const data: StatsResponse = await res.json();
      setStats(data.stats);
    } catch (e) {
      showToast(`Gagal memuat statistik: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setLoadingStats(false);
    }
  }

  async function handleDownloadBackup() {
    setLoadingBackup(true);
    try {
      const res = await adminFetch('/api/admin/backup');
      if (!res.ok) throw new Error('Gagal membuat backup');
      const data: BackupData = await res.json();
      setBackup(data);

      const totalRecords = Object.values(data.tables).reduce(
        (sum, rows) => sum + (Array.isArray(rows) ? rows.length : 0),
        0
      );

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const size = formatBytes(blob.size);

      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `biolearn-backup-${dateStr}.json`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(`Backup berhasil! ${totalRecords} record, ${size}`);
    } catch (e) {
      showToast(`Gagal membuat backup: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setLoadingBackup(false);
    }
  }

  const tableNames = backup ? Object.keys(backup.tables) : [];
  const totalRecords = backup
    ? Object.values(backup.tables).reduce((s, r) => s + (Array.isArray(r) ? r.length : 0), 0)
    : 0;
  const backupSize = backup ? formatBytes(new Blob([JSON.stringify(backup)]).size) : '-';

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Manajemen Backup"
        description="Kelola backup dan restore data platform"
        action={{
          label: loadingBackup ? 'Mendownload...' : 'Download Backup',
          onClick: handleDownloadBackup,
          icon: loadingBackup ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />,
        }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total User"
          value={stats?.totalUsers ?? '-'}
          icon={Database}
          color="accent"
          loading={loadingStats}
        />
        <StatsCard
          title="Total Materi"
          value={stats?.totalMateri ?? '-'}
          icon={FileJson}
          color="blue"
          loading={loadingStats}
        />
        <StatsCard
          title="Total Quiz"
          value={stats?.totalQuiz ?? '-'}
          icon={CheckCircle}
          color="green"
          loading={loadingStats}
        />
        <StatsCard
          title="Total Progress"
          value={stats?.totalProgress ?? '-'}
          icon={HardDrive}
          color="yellow"
          loading={loadingStats}
        />
      </div>

      {backup && (
        <div className="bg-surface rounded-xl border border-border p-5 space-y-3">
          <h3 className="text-sm font-semibold text-ink">Info Backup Terakhir</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted">
              <Clock className="w-4 h-4" />
              <span>Diekspor: <strong className="text-ink">{formatDate(backup.exported_at)}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-muted">
              <Database className="w-4 h-4" />
              <span>Tables: <strong className="text-ink">{tableNames.length}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-muted">
              <HardDrive className="w-4 h-4" />
              <span>Ukuran: <strong className="text-ink">{backupSize}</strong></span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {tableNames.map((t) => (
              <span key={t} className="text-xs bg-bg-alt border border-border rounded-lg px-2.5 py-1 text-muted">
                {t} <strong className="text-ink">{Array.isArray(backup.tables[t]) ? backup.tables[t].length : 0}</strong>
              </span>
            ))}
          </div>
          <p className="text-xs text-muted">Total {totalRecords} record across {tableNames.length} tables</p>
        </div>
      )}

      {loadingBackup && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
          <span className="text-sm text-blue-700 font-medium">Sedang membuat backup...</span>
        </div>
      )}

      <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
        <h3 className="text-sm font-semibold text-ink">Restore Backup</h3>
        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
          <Upload className="w-8 h-8 text-muted mx-auto mb-2" />
          <p className="text-sm text-muted">Drag & drop file backup (.json)</p>
          <p className="text-xs text-muted mt-1">Fitur restore akan tersedia di masa mendatang</p>
        </div>
      </div>
    </div>
  );
}
