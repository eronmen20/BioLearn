'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { Modal } from '@/components/admin/modal';
import { ConfirmDialog } from '@/components/admin/modal';
import { Image, Plus, Edit3, Trash2, Eye, EyeOff } from 'lucide-react';

interface Banner {
  id: number;
  judul: string;
  deskripsi: string;
  status: 'aktif' | 'nonaktif';
  posisi: string;
  created_at: string;
}

const placeholderBanners: Banner[] = [];

export default function BannerPage() {
  const [banners] = useState<Banner[]>(placeholderBanners);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState({ judul: '', deskripsi: '', posisi: 'hero', status: 'aktif'  as string });

  const handleAdd = () => {
    setSelectedBanner(null);
    setForm({ judul: '', deskripsi: '', posisi: 'hero', status: 'aktif' });
    setShowModal(true);
  };

  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner);
    setForm({ judul: banner.judul, deskripsi: banner.deskripsi, posisi: banner.posisi, status: banner.status });
    setShowModal(true);
  };

  const handleDelete = (banner: Banner) => {
    setSelectedBanner(banner);
    setShowDelete(true);
  };

  const columns: Column<Banner>[] = [
    { key: 'judul', label: 'Judul', sortable: true },
    { key: 'deskripsi', label: 'Deskripsi' },
    { key: 'posisi', label: 'Posisi', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            row.status === 'aktif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {row.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
        </span>
      ),
    },
    { key: 'created_at', label: 'Dibuat', sortable: true },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Manajemen Banner"
        description="Kelola banner yang tampil di website"
        action={{ label: 'Tambah Banner', onClick: handleAdd, icon: <Plus className="w-4 h-4" /> }}
      />

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <DataTable
          columns={columns}
          data={banners}
          searchPlaceholder="Cari banner..."
          emptyMessage="Belum ada banner. Klik &quot;Tambah Banner&quot; untuk menambahkan."
          actions={(row) => (
            <div className="flex items-center gap-1">
              <button onClick={() => handleEdit(row)} className="p-1.5 rounded-lg hover:bg-bg-alt text-muted transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(row)} className="p-1.5 rounded-lg hover:bg-red-50 text-red transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={selectedBanner ? 'Edit Banner' : 'Tambah Banner'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Judul</label>
            <input
              type="text"
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="Masukkan judul banner"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Deskripsi</label>
            <textarea
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 min-h-[80px]"
              placeholder="Deskripsi banner"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Posisi</label>
              <select
                value={form.posisi}
                onChange={(e) => setForm({ ...form, posisi: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="hero">Hero</option>
                <option value="sidebar">Sidebar</option>
                <option value="footer">Footer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as 'aktif' | 'nonaktif' })}
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Gambar</label>
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
              <Image className="w-8 h-8 text-muted mx-auto mb-2" />
              <p className="text-sm text-muted">Klik atau drag & drop gambar</p>
              <p className="text-xs text-muted mt-1">PNG, JPG, WebP maks 2MB</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-border rounded-xl hover:bg-bg-alt transition-colors">
              Batal
            </button>
            <button className="px-4 py-2 text-sm bg-accent text-white rounded-xl hover:bg-accent-dark transition-colors font-semibold">
              Simpan
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => setShowDelete(false)}
        title="Hapus Banner"
        message={`Yakin ingin menghapus banner "${selectedBanner?.judul}"?`}
        variant="danger"
      />
    </div>
  );
}
