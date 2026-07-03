'use client';

import { useState, useMemo, useCallback } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { BAB } from '@/lib/bab-data';
import { Layers, Plus, Edit, Trash2, RotateCcw, Eye } from 'lucide-react';

function toast(msg: string) {
  if (typeof window !== 'undefined') window.alert(msg);
}

interface Flashcard {
  id: string;
  babId: string;
  icon: string;
  pertanyaan: string;
  jawaban: string;
  kategori: string;
}

export default function FlashcardPage() {
  const [filterBab, setFilterBab] = useState<string>('all');

  const allCards = useMemo(() => {
    const cards: Flashcard[] = [];
    BAB.forEach((bab) => {
      bab.summary.id.forEach((s, i) => {
        cards.push({
          id: `fc-${bab.id}-${i + 1}`,
          babId: bab.id,
          icon: bab.icon,
          pertanyaan: `Apa yang dimaksud dengan konsep ${bab.id} bagian ${i + 1}?`,
          jawaban: s,
          kategori: bab.id,
        });
      });
    });
    return cards;
  }, []);

  const data = useMemo(() => {
    if (filterBab === 'all') return allCards;
    return allCards.filter((c) => c.babId === filterBab);
  }, [allCards, filterBab]);

  const columns: Column<Flashcard>[] = [
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
        <p className="text-sm text-ink truncate max-w-[250px]">{row.pertanyaan}</p>
      ),
    },
    {
      key: 'jawaban',
      label: 'Jawaban',
      render: (row) => (
        <p className="text-sm text-muted truncate max-w-[300px]">{row.jawaban}</p>
      ),
    },
    {
      key: 'kategori',
      label: 'Kategori',
      sortable: true,
      render: (row) => (
        <span className="inline-flex px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-semibold capitalize">
          {row.kategori}
        </span>
      ),
    },
  ];

  const handleAction = useCallback((action: string, id: string) => {
    toast(`${action} flashcard "${id}" — Coming soon!`);
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Manajemen Flashcard"
        description="Kelola flashcard untuk pembelajaran aktif"
        action={{
          label: 'Tambah Flashcard',
          onClick: () => toast('Tambah Flashcard — Coming soon!'),
        }}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{allCards.length}</p>
          <p className="text-xs text-muted mt-1">Total Kartu</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{BAB.length}</p>
          <p className="text-xs text-muted mt-1">Kategori</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-green-500">
            {allCards.length}
          </p>
          <p className="text-xs text-muted mt-1">Aktif</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-muted">0</p>
          <p className="text-xs text-muted mt-1">Draft</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilterBab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filterBab === 'all'
              ? 'bg-accent text-white'
              : 'bg-surface border border-border text-muted hover:text-ink'
          }`}
        >
          Semua
        </button>
        {BAB.map((bab) => (
          <button
            key={bab.id}
            onClick={() => setFilterBab(bab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterBab === bab.id
                ? 'bg-accent text-white'
                : 'bg-surface border border-border text-muted hover:text-ink'
            }`}
          >
            {bab.icon} {bab.id}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Cari flashcard..."
        searchKeys={['pertanyaan', 'jawaban', 'babId']}
        actions={(row) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleAction('Pratinjau', row.id)}
              className="p-1.5 rounded-lg hover:bg-accent/10 text-muted hover:text-accent transition-colors"
              title="Pratinjau"
            >
              <Eye className="w-4 h-4" />
            </button>
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
