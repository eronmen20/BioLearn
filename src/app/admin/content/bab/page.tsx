'use client';

import { useMemo, useCallback } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { BAB } from '@/lib/bab-data';
import { BookOpen, Edit, Trash2, Plus, Video, FileText } from 'lucide-react';

function toast(msg: string) {
  if (typeof window !== 'undefined') window.alert(msg);
}

export default function BabPage() {
  const data = useMemo(() =>
    BAB.map((b) => ({
      id: b.id,
      icon: b.icon,
      color: b.color,
      subBab: b.subs.length,
      videoId: b.videoId,
      judulVideo: b.video.id,
      jumlahSummary: b.summary.id.length,
      jumlahFull: b.full.id.length,
    })),
  []);

  const columns: Column<(typeof data)[0]>[] = [
    { key: 'id', label: 'ID', sortable: true, className: 'w-24' },
    {
      key: 'icon',
      label: 'Ikon',
      render: (row) => <span className="text-2xl">{row.icon}</span>,
      className: 'w-16',
    },
    {
      key: 'id',
      label: 'Nama Bab',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: row.color }} />
          <span className="font-medium text-ink capitalize">{row.id}</span>
        </div>
      ),
    },
    {
      key: 'subBab',
      label: 'Sub Bab',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-semibold">
          <FileText className="w-3 h-3" />
          {row.subBab}
        </span>
      ),
    },
    {
      key: 'judulVideo',
      label: 'Video',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-sm text-muted">
          <Video className="w-3.5 h-3.5 text-red-500" />
          <span className="truncate max-w-[200px]">{row.judulVideo}</span>
        </div>
      ),
    },
    {
      key: 'jumlahSummary',
      label: 'Summary',
      sortable: true,
    },
    {
      key: 'jumlahFull',
      label: 'Full Content',
      sortable: true,
    },
  ];

  const handleAction = useCallback((action: string, id: string) => {
    toast(`${action} bab "${id}" — Coming soon!`);
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Manajemen Bab"
        description="Kelola bab dan sub-bab materi pembelajaran"
        action={{
          label: 'Tambah Bab',
          onClick: () => toast('Tambah Bab — Coming soon!'),
        }}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{BAB.length}</p>
          <p className="text-xs text-muted mt-1">Total Bab</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">
            {BAB.reduce((a, b) => a + b.subs.length, 0)}
          </p>
          <p className="text-xs text-muted mt-1">Total Sub Bab</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">
            {BAB.filter((b) => b.videoId).length}
          </p>
          <p className="text-xs text-muted mt-1">Dengan Video</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">
            {BAB.reduce((a, b) => a + b.full.id.length, 0)}
          </p>
          <p className="text-xs text-muted mt-1">Konten Lengkap</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Cari bab..."
        searchKeys={['id', 'judulVideo']}
        actions={(row) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleAction('Edit', row.id)}
              className="p-1.5 rounded-lg hover:bg-blue-500/10 text-muted hover:text-blue-500 transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAction('Hapus', row.id)}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors"
              title="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />
    </div>
  );
}
