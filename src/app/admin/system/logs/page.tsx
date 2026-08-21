'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { StatsCard } from '@/components/admin/stats-card';
import {
  Activity, User, FileText, AlertTriangle, Info,
  Clock, Server, Globe, Loader2, CheckCircle, XCircle,
  Database, Trash2,
} from 'lucide-react';
import { showToast } from '@/components/ui/toaster';
import { adminFetch } from '@/lib/admin-fetch';

interface ActivityLog {
  id: number;
  created_at: string;
  user_email: string;
  user_role: string;
  action: string;
  target_type: string;
  target_id: string | null;
  detail: Record<string, unknown>;
  ip_address: string | null;
}

interface LogsResponse {
  logs: ActivityLog[];
  total: number;
  page: number;
  limit: number;
}

const ACTION_LABELS: Record<string, string> = {
  create: "Create",
  update: "Update",
  delete: "Delete",
};

const TARGET_LABELS: Record<string, string> = {
  bab: "Bab",
  sub_bab: "Sub Bab",
  materi: "Materi",
  sub_bab_quiz: "Quiz",
  praktikum: "Praktikum",
  kelas: "Kelas",
  struktur_fungsi: "Struktur",
  banners: "Banner",
  users: "User",
  site_settings: "Settings",
};

const columns: Column<ActivityLog>[] = [
  {
    key: 'created_at',
    label: 'Waktu',
    sortable: true,
    render: (row) => (
      <span className="text-xs font-mono">
        {new Date(row.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </span>
    ),
  },
  {
    key: 'user_email',
    label: 'User',
    sortable: true,
    render: (row) => (
      <div>
        <p className="text-sm font-medium text-ink">{row.user_email}</p>
        <p className="text-xs text-muted">{row.user_role}</p>
      </div>
    ),
  },
  {
    key: 'action',
    label: 'Aksi',
    sortable: true,
    render: (row) => {
      const colors: Record<string, string> = {
        create: 'bg-green-100 text-green-700',
        update: 'bg-blue-100 text-blue-700',
        delete: 'bg-red-100 text-red-700',
      };
      return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[row.action] || 'bg-gray-100 text-gray-700'}`}>
          {ACTION_LABELS[row.action] || row.action}
        </span>
      );
    },
  },
  {
    key: 'target_type',
    label: 'Target',
    sortable: true,
    render: (row) => (
      <div>
        <span className="text-sm text-ink">{TARGET_LABELS[row.target_type] || row.target_type}</span>
        {row.target_id && <span className="text-xs text-muted ml-1">({row.target_id})</span>}
      </div>
    ),
  },
  {
    key: 'ip_address',
    label: 'IP',
    render: (row) => <span className="text-xs text-muted font-mono">{row.ip_address || '-'}</span>,
  },
];

export default function ActivityLogsPage() {
  const [data, setData] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dbTesting, setDbTesting] = useState(false);
  const [dbStatus, setDbStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [currentTime, setCurrentTime] = useState('');
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchLogs();
    setCurrentTime(new Date().toLocaleString('id-ID'));
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('id-ID'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/logs?limit=100');
      if (!res.ok) throw new Error('Failed');
      const data: LogsResponse = await res.json();
      setData(data.logs || []);
      setTotal(data.total || 0);
    } catch {
      showToast('Gagal memuat log aktivitas');
    } finally {
      setLoading(false);
    }
  }

  async function handleTestDb() {
    setDbTesting(true);
    setDbStatus('idle');
    try {
      const res = await adminFetch('/api/admin/backup');
      if (!res.ok) throw new Error('Connection failed');
      await res.json();
      setDbStatus('success');
      showToast('Database terhubung!');
    } catch {
      setDbStatus('error');
      showToast('Koneksi database gagal');
    } finally {
      setDbTesting(false);
    }
  }

  function handleClearCache() {
    showToast('Cache dibersihkan (placeholder)');
  }

  async function handleClearOldLogs() {
    setClearing(true);
    try {
      const res = await adminFetch('/api/admin/logs', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      const result = await res.json();
      showToast(`Berhasil menghapus ${result.deleted || 0} log lama (>30 hari)`);
      fetchLogs();
    } catch {
      showToast('Gagal menghapus log lama');
    } finally {
      setClearing(false);
    }
  }

  const createCount = data.filter((l) => l.action === 'create').length;
  const updateCount = data.filter((l) => l.action === 'update').length;
  const deleteCount = data.filter((l) => l.action === 'delete').length;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Log Aktivitas" description="Riwayat aktivitas dan informasi sistem" />

      {/* System Info */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-ink">System Info</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-bg-alt rounded-lg">
            <Clock className="w-4 h-4 text-muted" />
            <div>
              <p className="text-xs text-muted">Waktu Sekarang</p>
              <p className="text-sm font-medium text-ink font-mono">{currentTime || '...'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-bg-alt rounded-lg">
            <FileText className="w-4 h-4 text-muted" />
            <div>
              <p className="text-xs text-muted">App Version</p>
              <p className="text-sm font-medium text-ink">0.1.0</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-bg-alt rounded-lg">
            <Globe className="w-4 h-4 text-muted" />
            <div>
              <p className="text-xs text-muted">Environment</p>
              <p className="text-sm font-medium text-ink">{process.env.NODE_ENV || 'development'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Log" value={total} icon={Activity} color="accent" />
        <StatsCard title="Create" value={createCount} icon={CheckCircle} color="green" />
        <StatsCard title="Update" value={updateCount} icon={Info} color="blue" />
        <StatsCard title="Delete" value={deleteCount} icon={AlertTriangle} color="red" />
      </div>

      {/* Recent Activity Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-sm font-semibold text-ink">Semua Aktivitas</h3>
        </div>
        <DataTable
          columns={columns as any}
          data={data as any}
          searchPlaceholder="Cari log aktivitas..."
          emptyMessage="Belum ada log aktivitas"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-ink">Quick Actions</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleTestDb}
            disabled={dbTesting}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50"
          >
            {dbTesting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : dbStatus === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : dbStatus === 'error' ? (
              <XCircle className="w-4 h-4" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            {dbTesting ? 'Mengecek...' : 'Test Database Connection'}
          </button>
          <button
            onClick={handleClearOldLogs}
            disabled={clearing}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            {clearing ? 'Menghapus...' : 'Hapus Log (>30 Hari)'}
          </button>
          <button
            onClick={handleClearCache}
            className="flex items-center gap-2 px-4 py-2.5 bg-bg-alt border border-border text-ink rounded-xl text-sm font-semibold hover:bg-border transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  );
}
