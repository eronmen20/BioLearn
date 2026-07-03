'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { Modal, ConfirmDialog } from '@/components/admin/modal';
import { showToast } from '@/components/ui/toaster';
import { BAB } from '@/lib/bab-data';
import { GraduationCap, BookOpen, Edit, Trash2, Save, Loader2, Palette } from 'lucide-react';

interface KelasItem {
  id: string;
  nama: string;
  nama_en: string;
  deskripsi: string;
  deskripsi_en: string;
  icon: string;
  color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const ICON_OPTIONS = ['🎓', '📚', '🔬', '🧪', '🧬', '🌿', '🧠', '🫀', '🦠', '🍽️', '🦕', '📖', '🏫', '✏️', '📐', '🔭'];
const COLOR_OPTIONS = ['#6c5ce7', '#00b894', '#00cec9', '#e17055', '#6ab04c', '#a29bfe', '#fd79a8', '#0984e3', '#fdcb6e', '#e84393'];

export default function KelasPage() {
  const [kelas, setKelas] = useState<KelasItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<KelasItem | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState<KelasItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    id: '',
    nama: '',
    nama_en: '',
    deskripsi: '',
    deskripsi_en: '',
    icon: '🎓',
    color: '#6c5ce7',
    sort_order: 0,
  });

  const loadKelas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/kelas');
      const data = await res.json();
      setKelas(data.kelas || []);
    } catch {
      showToast('Gagal memuat data kelas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadKelas(); }, [loadKelas]);

  const handleAdd = () => {
    setEditing(null);
    setForm({
      id: '',
      nama: '',
      nama_en: '',
      deskripsi: '',
      deskripsi_en: '',
      icon: '🎓',
      color: '#6c5ce7',
      sort_order: 0,
    });
    setShowEditor(true);
  };

  const handleEdit = (item: KelasItem) => {
    setEditing(item);
    setForm({
      id: item.id,
      nama: item.nama,
      nama_en: item.nama_en || '',
      deskripsi: item.deskripsi || '',
      deskripsi_en: item.deskripsi_en || '',
      icon: item.icon || '🎓',
      color: item.color || '#6c5ce7',
      sort_order: item.sort_order || 0,
    });
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!form.id.trim()) return showToast('ID kelas wajib diisi');
    if (!form.nama.trim()) return showToast('Nama kelas wajib diisi');
    setSaving(true);
    try {
      const payload = { ...form };
      const res = await fetch('/api/admin/kelas', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed');
      showToast(editing ? 'Kelas berhasil diupdate!' : 'Kelas berhasil ditambahkan!');
      setShowEditor(false);
      loadKelas();
    } catch {
      showToast('Gagal menyimpan kelas');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/admin/kelas?id=${deleting.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      showToast('Kelas berhasil dihapus!');
      setShowDelete(false);
      setDeleting(null);
      loadKelas();
    } catch {
      showToast('Gagal menghapus kelas');
    }
  };

  const columns: Column<KelasItem>[] = [
    {
      key: 'icon',
      label: 'Ikon',
      render: (row) => (
        <span
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-lg"
          style={{ backgroundColor: (row.color || '#6c5ce7') + '20' }}
        >
          {row.icon || '🎓'}
        </span>
      ),
    },
    {
      key: 'nama',
      label: 'Nama Kelas',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-ink">{row.nama}</span>
          {row.nama_en && (
            <span className="text-xs text-muted">({row.nama_en})</span>
          )}
        </div>
      ),
    },
    {
      key: 'deskripsi',
      label: 'Deskripsi',
      render: (row) => (
        <span className="text-xs text-muted max-w-[200px] truncate block">
          {row.deskripsi || '—'}
        </span>
      ),
    },
    {
      key: 'id',
      label: 'Jumlah Bab',
      render: (row) => {
        const babCount = BAB.filter((b) => {
          // Estimate based on matching kelas id pattern
          return false; // Will show dynamic count from DB later
        }).length;
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
            <BookOpen className="w-3 h-3" />
            {babCount} bab
          </span>
        );
      },
    },
    {
      key: 'sort_order',
      label: 'Urutan',
      sortable: true,
    },
    {
      key: 'updated_at',
      label: 'Diubah',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-muted">
          {row.updated_at
            ? new Date(row.updated_at).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Manajemen Kelas"
        description="Kelola data kelas (tingkat) beserta informasinya"
        action={{ label: 'Tambah Kelas', onClick: handleAdd }}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{kelas.length}</p>
          <p className="text-xs text-muted mt-1">Total Kelas</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{BAB.length}</p>
          <p className="text-xs text-muted mt-1">Total Bab</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">
            {BAB.reduce((acc, b) => acc + b.subs.length, 0)}
          </p>
          <p className="text-xs text-muted mt-1">Total Sub Bab</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-accent">3</p>
          <p className="text-xs text-muted mt-1">Tingkat (X, XI, XII)</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={kelas as any}
        loading={loading}
        searchPlaceholder="Cari kelas..."
        searchKeys={['nama', 'nama_en', 'id']}
        emptyMessage="Belum ada kelas. Klik 'Tambah Kelas' untuk menambahkan."
        actions={(row) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleEdit(row)}
              className="p-1.5 rounded-lg hover:bg-bg-alt text-muted hover:text-blue-500 transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setDeleting(row);
                setShowDelete(true);
              }}
              className="p-1.5 rounded-lg hover:bg-red/5 text-red"
              title="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Editor Modal */}
      <Modal
        open={showEditor}
        onClose={() => setShowEditor(false)}
        title={editing ? `Edit Kelas: ${editing.nama}` : 'Tambah Kelas'}
        size="lg"
      >
        <div className="space-y-4">
          {/* ID & Nama */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                ID Kelas <span className="text-red">*</span>
              </label>
              <input
                type="text"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                placeholder="x / xi / xii"
                disabled={!!editing}
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50"
              />
              <p className="text-xs text-muted mt-1">Contoh: x, xi, xii</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Nama (ID) <span className="text-red">*</span>
              </label>
              <input
                type="text"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                placeholder="Kelas X"
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Nama (EN)</label>
            <input
              type="text"
              value={form.nama_en}
              onChange={(e) => setForm({ ...form, nama_en: e.target.value })}
              placeholder="Grade 10"
              className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          {/* Deskripsi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Deskripsi (ID)</label>
              <textarea
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                rows={3}
                placeholder="Deskripsi singkat tentang kelas ini..."
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Deskripsi (EN)</label>
              <textarea
                value={form.deskripsi_en}
                onChange={(e) => setForm({ ...form, deskripsi_en: e.target.value })}
                rows={3}
                placeholder="Short description about this grade..."
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
              />
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Ikon Kelas</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm({ ...form, icon })}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                    form.icon === icon
                      ? 'bg-accent text-white scale-110 shadow-md ring-2 ring-accent/30'
                      : 'bg-bg-alt border border-border hover:border-accent/50'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">
              <Palette className="w-4 h-4 inline mr-1" />
              Warna Tema
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`w-8 h-8 rounded-full transition-all ${
                    form.color === color
                      ? 'ring-2 ring-offset-2 ring-accent scale-110'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Urutan</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              className="w-32 px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          {/* Preview */}
          <div className="bg-bg-alt rounded-xl border border-border p-4">
            <label className="block text-xs font-medium text-muted mb-2">Preview</label>
            <div className="flex items-center gap-3">
              <span
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-2xl"
                style={{ backgroundColor: form.color + '20' }}
              >
                {form.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{form.nama || 'Nama Kelas'}</p>
                {form.nama_en && <p className="text-xs text-muted">{form.nama_en}</p>}
                {form.deskripsi && <p className="text-xs text-muted mt-0.5">{form.deskripsi}</p>}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={() => setShowEditor(false)}
              className="px-4 py-2.5 text-sm border border-border rounded-xl hover:bg-bg-alt transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Kelas"
        message={`Yakin ingin menghapus kelas "${deleting?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
