'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { Modal, ConfirmDialog } from '@/components/admin/modal';
import { Image, Plus, Edit3, Trash2 } from 'lucide-react';
import { showToast } from '@/components/ui/toaster';

interface Banner {
  id: number;
  judul: string;
  deskripsi: string;
  status: 'aktif' | 'nonaktif';
  posisi: string;
  image_url?: string | null;
  link_url?: string | null;
  created_at: string;
}

const EMPTY_FORM = { judul: '', deskripsi: '', posisi: 'hero', status: 'aktif' as string, image_url: '', link_url: '' };

export default function BannerPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/banner');
      const data = await res.json();
      setBanners(data.banners || []);
    } catch {
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const handleAdd = () => {
    setSelectedBanner(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner);
    setForm({
      judul: banner.judul,
      deskripsi: banner.deskripsi,
      posisi: banner.posisi,
      status: banner.status,
      image_url: banner.image_url || '',
      link_url: banner.link_url || '',
    });
    setShowModal(true);
  };

  const handleDelete = (banner: Banner) => {
    setSelectedBanner(banner);
    setShowDelete(true);
  };

  const handleSave = async () => {
    if (!form.judul.trim()) {
      showToast('Judul banner wajib diisi');
      return;
    }
    setSaving(true);
    try {
      const url = '/api/admin/banner';
      const method = selectedBanner ? 'PUT' : 'POST';
      const payload = selectedBanner
        ? { id: selectedBanner.id, ...form }
        : form;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('gagal');
      showToast(selectedBanner ? 'Banner berhasil diperbarui!' : 'Banner berhasil ditambahkan!');
      setShowModal(false);
      fetchBanners();
    } catch {
      showToast('Gagal menyimpan banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBanner) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/banner?id=${selectedBanner.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('gagal');
      showToast('Banner berhasil dihapus!');
      setShowDelete(false);
      fetchBanners();
    } catch {
      showToast('Gagal menghapus banner');
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Banner>[] = [
    {
      key: 'judul',
      label: 'Judul',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.image_url ? (
            <img src={row.image_url} alt="" className="w-8 h-8 rounded object-cover" />
          ) : (
            <div className="w-8 h-8 rounded bg-bg-alt flex items-center justify-center text-muted">
              <Image className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="font-medium text-ink">{row.judul}</span>
        </div>
      ),
    },
    {
      key: 'deskripsi',
      label: 'Deskripsi',
      render: (row) => <span className="text-muted line-clamp-1 max-w-[240px]">{row.deskripsi || '—'}</span>,
    },
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
    {
      key: 'created_at',
      label: 'Dibuat',
      sortable: true,
      render: (row) => new Date(row.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    },
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
          loading={loading}
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
            <label className="block text-sm font-medium text-ink mb-1">URL Gambar</label>
            <input
              type="text"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="https://... atau /images/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">URL Tautan</label>
            <input
              type="text"
              value={form.link_url}
              onChange={(e) => setForm({ ...form, link_url: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              placeholder="Arahkan ke halaman saat banner diklik"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-border rounded-xl hover:bg-bg-alt transition-colors">
              Batal
            </button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-accent text-white rounded-xl hover:bg-accent-dark transition-colors font-semibold disabled:opacity-50">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Banner"
        message={`Yakin ingin menghapus banner "${selectedBanner?.judul}"?`}
        variant="danger"
        loading={saving}
        confirmLabel="Hapus"
      />
    </div>
  );
}