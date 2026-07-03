'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import {
  Database, Table2, RefreshCw, Server, Download,
  Loader2, CheckCircle, XCircle, HardDrive, Clock,
} from 'lucide-react';
import { showToast } from '@/components/ui/toaster';

interface TableInfo {
  name: string;
  rowCount: number;
  lastUpdated: string;
}

const TABLES = [
  'bab', 'materi', 'users', 'progress', 'kelas',
  'sub_bab', 'sub_bab_quiz', 'struktur_fungsi', 'site_settings',
];

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
      // Test connection via backup API (it fetches all tables)
      const res = await fetch('/api/admin/backup');
      if (!res.ok) throw new Error('Connection failed');
      const data = await res.json();
      setConnectionStatus('connected');

      const results: TableInfo[] = [];
      for (const table of TABLES) {
        const rows = (data.tables && data.tables[table]) || [];
        results.push({
          name: table,
          rowCount: rows.length,
          lastUpdated: rows.length > 0 ? 'Active' : 'Empty',
        });
      }
      setTables(results);
    } catch {
      setConnectionStatus('error');
      showToast('Gagal memuat info database');
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
    showToast('Data di-refresh!');
  }

  async function handleBackup() {
    setBacking(true);
    try {
      const res = await fetch('/api/admin/backup');
      const data = await res.json();

      // Download as JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `biolearn-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Backup berhasil di-download!');
    } catch {
      showToast('Gagal membuat backup');
    } finally {
      setBacking(false);
    }
  }

  const totalRows = tables.reduce((a, b) => a + b.rowCount, 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Database"
        description="Informasi dan backup database Supabase"
      />

      {/* Connection Status */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-ink">Status Koneksi</h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-bg-alt hover:bg-border transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <div className="flex items-center gap-3">
          {connectionStatus === 'connected' && <CheckCircle className="w-5 h-5 text-green" />}
          {connectionStatus === 'error' && <XCircle className="w-5 h-5 text-red" />}
          {connectionStatus === 'checking' && <Loader2 className="w-5 h-5 text-muted animate-spin" />}
          <div>
            <p className="text-sm font-medium text-ink">
              {connectionStatus === 'connected' && 'Terhubung'}
              {connectionStatus === 'error' && 'Error'}
              {connectionStatus === 'checking' && 'Mengecek...'}
            </p>
            <p className="text-xs text-muted">Supabase PostgreSQL</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{tables.length}</p>
          <p className="text-xs text-muted mt-1">Total Tabel</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{totalRows}</p>
          <p className="text-xs text-muted mt-1">Total Rows</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-green">
            {connectionStatus === 'connected' ? '✓' : '✗'}
          </p>
          <p className="text-xs text-muted mt-1">Connection</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-accent">v2</p>
          <p className="text-xs text-muted mt-1">Schema</p>
        </div>
      </div>

      {/* Tables */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-ink">Tabel Database</h3>
        </div>
        <div className="divide-y divide-border">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-accent mx-auto" />
            </div>
          ) : (
            tables.map((table) => (
              <div key={table.name} className="flex items-center justify-between px-4 py-3 hover:bg-bg-alt transition-colors">
                <div className="flex items-center gap-3">
                  <Table2 className="w-4 h-4 text-muted" />
                  <div>
                    <p className="text-sm font-medium text-ink font-mono">{table.name}</p>
                    <p className="text-[10px] text-muted">{table.lastUpdated}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/10 text-accent">
                  {table.rowCount} rows
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Backup */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-3">
          <HardDrive className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-ink">Backup</h3>
        </div>
        <p className="text-xs text-muted mb-4">
          Export semua data dari semua tabel sebagai file JSON.
        </p>
        <button
          onClick={handleBackup}
          disabled={backing || connectionStatus !== 'connected'}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50"
        >
          {backing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {backing ? 'Membuat backup...' : 'Download Backup JSON'}
        </button>
      </div>
    </div>
  );
}
