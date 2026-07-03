'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { Modal, ConfirmDialog } from '@/components/admin/modal';
import { Brain, Plus, Edit3, Trash2, Copy, Zap } from 'lucide-react';

interface Prompt {
  id: number;
  nama: string;
  deskripsi: string;
  model: string;
  status: 'aktif' | 'nonaktif';
  updated_at: string;
}

const placeholderData: Prompt[] = [];

export default function PromptsPage() {
  const [data] = useState<Prompt[]>(placeholderData);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState<Prompt | null>(null);
  const [form, setForm] = useState({ nama: '', deskripsi: '', prompt_text: '', model: 'gpt-4o', status: 'aktif' as string });

  const handleAdd = () => {
    setSelected(null);
    setForm({ nama: '', deskripsi: '', prompt_text: '', model: 'gpt-4o', status: 'aktif' });
    setShowModal(true);
  };

  const handleEdit = (item: Prompt) => {
    setSelected(item);
    setForm({ nama: item.nama, deskripsi: item.deskripsi, prompt_text: '', model: item.model, status: item.status as 'aktif' });
    setShowModal(true);
  };

  const columns: Column<Prompt>[] = [
    { key: 'nama', label: 'Nama Prompt', sortable: true },
    { key: 'deskripsi', label: 'Deskripsi' },
    { key: 'model', label: 'Model', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${row.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {row.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
        </span>
      ),
    },
    { key: 'updated_at', label: 'Terakhir Diubah', sortable: true },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Manajemen Prompt AI"
        description="Kelola prompt yang digunakan oleh AI assistant"
        action={{ label: 'Tambah Prompt', onClick: handleAdd, icon: <Plus className="w-4 h-4" /> }}
      />

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <DataTable
          columns={columns}
          data={data}
          searchPlaceholder="Cari prompt..."
          emptyMessage="Belum ada prompt yang dikonfigurasi"
          actions={(row) => (
            <div className="flex items-center gap-1">
              <button onClick={() => handleEdit(row)} className="p-1.5 rounded-lg hover:bg-bg-alt text-muted transition-colors"><Edit3 className="w-4 h-4" /></button>
              <button onClick={() => { setSelected(row); setShowDelete(true); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          )}
        />
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={selected ? 'Edit Prompt' : 'Tambah Prompt'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Nama Prompt</label>
            <input type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" placeholder="Contoh: Materi Explanation" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Deskripsi</label>
            <input type="text" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" placeholder="Deskripsi singkat" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">System Prompt</label>
            <textarea value={form.prompt_text} onChange={(e) => setForm({ ...form, prompt_text: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 min-h-[200px] font-mono text-xs" placeholder="Tulis system prompt di sini..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Model</label>
              <select value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'aktif' | 'nonaktif' })} className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-border rounded-xl hover:bg-bg-alt transition-colors">Batal</button>
            <button className="px-4 py-2 text-sm bg-accent text-white rounded-xl hover:bg-accent-dark transition-colors font-semibold">Simpan</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={() => setShowDelete(false)} title="Hapus Prompt" message={`Yakin ingin menghapus prompt "${selected?.nama}"?`} variant="danger" />
    </div>
  );
}
