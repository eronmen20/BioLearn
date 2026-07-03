'use client';

import { useState, useMemo } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { KELAS, BAB } from '@/lib/bab-data';
import { GraduationCap, BookOpen, Eye } from 'lucide-react';

export default function KelasPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const data = useMemo(() =>
    KELAS.map((k) => ({
      id: k.id,
      nama: k.nama,
      jumlahMateri: k.materi.length,
      materiList: k.materi
        .map((mId) => BAB.find((b) => b.id === mId))
        .filter(Boolean)
        .map((b) => `${b!.icon} ${b!.id}`)
        .join(', '),
    })),
  []);

  const columns: Column<(typeof data)[0]>[] = [
    { key: 'id', label: 'ID', sortable: true, className: 'w-20' },
    {
      key: 'nama',
      label: 'Nama Kelas',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-accent" />
          <span className="font-medium">{row.nama}</span>
        </div>
      ),
    },
    {
      key: 'jumlahMateri',
      label: 'Jumlah Materi',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
          <BookOpen className="w-3 h-3" />
          {row.jumlahMateri} bab
        </span>
      ),
    },
    {
      key: 'materiList',
      label: 'Daftar Materi',
      render: (row) => (
        <span className="text-sm text-muted">{row.materiList}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Manajemen Kelas"
        description="Lihat daftar kelas dan materi yang terkait"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {KELAS.map((k) => (
          <div
            key={k.id}
            className="bg-surface rounded-xl border border-border p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{k.nama}</p>
              <p className="text-xs text-muted">{k.materi.length} materi</p>
            </div>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Cari kelas..."
        searchKeys={['nama', 'id']}
        actions={(row) => (
          <button
            onClick={() => setExpandedId(row.id === expandedId ? null : row.id)}
            className="p-1.5 rounded-lg hover:bg-bg-alt text-muted hover:text-ink transition-colors"
            title="Lihat detail"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      />

      {/* Detail panel */}
      {expandedId && (
        <div className="bg-surface rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-ink mb-3">
            Detail Kelas {KELAS.find((k) => k.id === expandedId)?.nama}
          </h3>
          <div className="space-y-2">
            {KELAS.find((k) => k.id === expandedId)?.materi.map((mId) => {
              const bab = BAB.find((b) => b.id === mId);
              if (!bab) return null;
              return (
                <div
                  key={mId}
                  className="flex items-center gap-3 p-3 rounded-lg bg-bg-alt"
                >
                  <span className="text-lg">{bab.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-ink capitalize">{bab.id}</p>
                    <p className="text-xs text-muted">{bab.subs.length} sub-bab</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
