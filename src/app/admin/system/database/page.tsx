'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import {
  Database, Table2, RefreshCw, Server, Download,
  Loader2, CheckCircle, XCircle, HardDrive, Clock,
} from 'lucide-react';
import { showToast } from '@/components/ui/toaster';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TABLES = [
  'bab', 'materi', 'users', 'progress', 'kelas',
  'sub_bab', 'sub_bab_quiz', 'struktur_fungsi', 'site_settings',
];

interface TableInfo {
  name: string;
  rowCount: number;
  lastUpdated: string;
}

export default function DatabaseInfoPage() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'error' | 'checking'>('checking');
  const [loading, setLoading] = useState(true);
  const [backing, setBacking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    setConnectionStatus('checking');

    try {
      // Test connection
      const { error: connError } = await supabase.from('bab').select('id', { count: 'exact', head: true });
      setConnectionStatus(connError ? 'error' : 'connected');

      const results: TableInfo[] = [];
      for (const table of TABLES) {
        try {
          const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
          const { data: lastRow } = await supabase
            .from(table)
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          results.push({
            name: table,
            rowCount: count ?? 0,
            lastUpdated: lastRow?.created_at || lastRow?.updated_at || '-',
          });
        } catch {
          results.push({ name: table, rowCount: 0, lastUpdated: '-' });
        }
      }
      setTables(results);
    } catch {
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const handleBackup = async () => {
    setBacking(true);
    try {
      const res = await fetch('/api/admin/backup');
      if (!res.ok) throw new Error('Backup gagal');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `biolearn-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup berhasil diunduh!');
    } catch {
      showToast('Gagal membuat backup');
    } finally {
      setBacking(false);
    }
  };

  const totalRows = tables.reduce((s, t) => s + t.rowCount, 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Informasi Database"
        description="Status dan statistik database Supabase"
        action={{
          label: refreshing ? 'Memuat...' : 'Refresh',
          onClick: handleRefresh,
          icon: <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />,
        }}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Table2 className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted">Total Tabel</p>
            <p className="text-lg font-bold text-ink">{tables.length}</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <HardDrive className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-xs text-muted">Total Baris</p>
            <p className="text-lg font-bold text-ink">{totalRows.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Server className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-muted">Koneksi</p>
            <div className="flex items-center gap-1.5">
              {connectionStatus === 'connected' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : connectionStatus === 'error' ? (
                <XCircle className="w-4 h-4 text-red-500" />
              ) : (
                <Loader2 className="w-4 h-4 animate-spin text-muted" />
              )}
              <p className="text-lg font-bold text-ink">
                {connectionStatus === 'connected' ? 'Aktif' : connectionStatus === 'error' ? 'Error' : '...'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <Database className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-muted">Provider</p>
            <p className="text-lg font-bold text-ink">Supabase</p>
          </div>
        </div>
      </div>

      {/* Connection Details */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-ink">Detail Koneksi</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Provider', value: 'Supabase' },
            { label: 'Status', value: connectionStatus === 'connected' ? 'Terhubung' : 'Error' },
            { label: 'SSL', value: 'Enabled' },
            { label: 'PostgreSQL', value: '15.x' },
            { label: 'Pooling', value: 'PgBouncer' },
            { label: 'URL', value: process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.slice(0, 30) + '...' || '-' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 bg-bg-alt rounded-xl">
              <span className="text-xs text-muted">{item.label}</span>
              <span className="text-sm font-semibold text-ink">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table List */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Table2 className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-ink">Daftar Tabel</h3>
          </div>
          <button
            onClick={handleBackup}
            disabled={backing}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl text-xs font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50"
          >
            {backing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Export JSON
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase">Tabel</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase">Baris</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase">Terakhir Diperbarui</th>
                </tr>
              </thead>
              <tbody>
                {tables.map((t) => (
                  <tr key={t.name} className="border-b border-border/50 hover:bg-bg-alt/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-muted" />
                        <span className="font-mono text-ink font-medium">{t.name}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-mono text-ink">
                      {t.rowCount.toLocaleString()}
                    </td>
                    <td className="text-right py-3 px-4 text-muted">
                      <div className="flex items-center justify-end gap-1.5">
                        <Clock className="w-3 h-3" />
                        {t.lastUpdated === '-' ? '-' : new Date(t.lastUpdated).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
