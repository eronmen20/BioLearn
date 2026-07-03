'use client';

import { useMemo, useCallback } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { QUIZ } from '@/lib/quiz-data';
import { BAB } from '@/lib/bab-data';
import { HelpCircle, Edit, Trash2, Plus, CheckCircle } from 'lucide-react';

function toast(msg: string) {
  if (typeof window !== 'undefined') window.alert(msg);
}

interface QuizRow {
  id: string;
  babId: string;
  icon: string;
  pertanyaan: string;
  pilihan: string;
  jawabanBenar: string;
  jumlahPilihan: number;
}

export default function QuizPage() {
  const data = useMemo(() => {
    const rows: QuizRow[] = [];
    Object.entries(QUIZ).forEach(([babId, questions]) => {
      const bab = BAB.find((b) => b.id === babId);
      questions.forEach((q, i) => {
        rows.push({
          id: `quiz-${babId}-${i + 1}`,
          babId,
          icon: bab?.icon ?? '❓',
          pertanyaan: q.q.id,
          pilihan: q.opts.id.join(' | '),
          jawabanBenar: q.opts.id[q.ans],
          jumlahPilihan: q.opts.id.length,
        });
      });
    });
    return rows;
  }, []);

  const stats = useMemo(() => {
    const totalQ = data.length;
    const babCount = Object.keys(QUIZ).length;
    const avgPerBab = babCount > 0 ? Math.round(totalQ / babCount) : 0;
    return { totalQ, babCount, avgPerBab };
  }, [data]);

  const columns: Column<QuizRow>[] = [
    { key: 'id', label: 'ID', sortable: true, className: 'w-32' },
    {
      key: 'babId',
      label: 'Bab',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span>{row.icon}</span>
          <span className="font-medium text-ink capitalize">{row.babId}</span>
        </div>
      ),
    },
    {
      key: 'pertanyaan',
      label: 'Pertanyaan',
      render: (row) => (
        <p className="text-sm text-ink truncate max-w-[300px]">{row.pertanyaan}</p>
      ),
    },
    {
      key: 'jawabanBenar',
      label: 'Jawaban Benar',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
          <CheckCircle className="w-3.5 h-3.5" />
          {row.jawabanBenar}
        </span>
      ),
    },
    {
      key: 'jumlahPilihan',
      label: 'Pilihan',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-muted">{row.jumlahPilihan} opsi</span>
      ),
    },
  ];

  const handleAction = useCallback((action: string, id: string) => {
    toast(`${action} soal "${id}" — Coming soon!`);
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Manajemen Quiz"
        description="Kelola bank soal quiz per bab"
        action={{
          label: 'Tambah Soal',
          onClick: () => toast('Tambah Soal — Coming soon!'),
        }}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{stats.totalQ}</p>
          <p className="text-xs text-muted mt-1">Total Soal</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{stats.babCount}</p>
          <p className="text-xs text-muted mt-1">Bab dengan Quiz</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{stats.avgPerBab}</p>
          <p className="text-xs text-muted mt-1">Rata-rata/Bab</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-green-500">4</p>
          <p className="text-xs text-muted mt-1">Pilihan/Soal</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Cari soal quiz..."
        searchKeys={['pertanyaan', 'babId', 'jawabanBenar']}
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
