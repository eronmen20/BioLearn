'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { Modal, ConfirmDialog } from '@/components/admin/modal';
import { Megaphone, Plus, Edit3, Trash2, Pin, PinOff } from 'lucide-react';

interface Pengumuman {
  id: number;
  judul: string;
  isi: string;
  pinned: boolean;
  status: 'published' | 'draft';
  created_at: string;
}

const placeholderData: Pengumuman[] = [];

export default function PengumumanPage() {
  const [data] = useState<Pengumuman[]>(placeholderData);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState<Pengumuman | null>(null);
  const [form, setForm] = useState({ judul: '', isi: '', status: 'published'  as string, pinned: false });

  const handleAdd = () => {
    setSelected(null);
    setForm({ judul: '', isi: '', status: 'published', pinned: false });
    setShowModal(true);
  };

  const handleEdit = (item: Pengumuman) => {
    setSelected(item);
    setForm({ judul: item.judul, isi: item.isi, status: item.status, pinned: item.pinned });
    setShowModal(true);
  };

  const columns: Column<Pengumuman>[] = [
    { key: 'judul', label: 'Judul', sortable: true },
    {
      key: 'pinned',
      label: 'Pinned',
      render: (row) =>
        row.pinned ? <Pin className="w-4 h-4 text-accent" /> : <PinOff className="w-4 h-4 text-muted" />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            row.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {row.status === 'published' ? 'Dipublikasi' : 'Draft'}
        </span>
      ),
    },
    { key: 'created_at', label: 'Tanggal', sortable: true },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pengumuman"
        description="Kelola pengumuman untuk siswa dan guru"
        action={{ label: 'Buat Pengumuman', onClick: handleAdd, icon: <Plus className="w-4 h-4" /> }}
      />

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Cari pengumuman..."
          emptyMessage="Belum ada pengumuman"
          actions={(row) => (
            <div className="flex items-center gap-1">
              <button onClick={() => handleEdit(row)} className="p-1.5 rounded-lg hover:bg-bg-alt text-muted transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => { setSelected(row); setShowDelete(true); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={selected ? 'Edit Pengumuman' : 'Buat Pengumuman'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Judul</label>
            <input
              type="text"
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="Judul pengumuman"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Isi Pengumuman</label>
            <textarea
              value={form.isi}
              onChange={(e) => setForm({ ...form, isi: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 min-h-[160px]"
              placeholder="Tulis isi pengumuman..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as 'published' | 'draft' })}
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="published">Dipublikasi</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Pinned</label>
              <button
                onClick={() => setForm({ ...form, pinned: !form.pinned })}
                className={`w-full px-3 py-2 border rounded-xl text-sm font-medium transition-colors ${
                  form.pinned ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-surface text-muted'
                }`}
              >
                {form.pinned ? '📌 Dipin' : 'Sematkan?'}
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-border rounded-xl hover:bg-bg-alt transition-colors">Batal</button>
            <button className="px-4 py-2 text-sm bg-accent text-white rounded-xl hover:bg-accent-dark transition-colors font-semibold">Simpan</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={() => setShowDelete(false)} title="Hapus Pengumuman" message={`Yakin ingin menghapus "${selected?.judul}"?`} variant="danger" />
    </div>
  );
}
