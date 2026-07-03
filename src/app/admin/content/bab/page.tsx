'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { Modal, ConfirmDialog } from '@/components/admin/modal';
import { showToast } from '@/components/ui/toaster';
import { BookOpen, Edit, Trash2, Plus, Video, FileText, Save, Loader2 } from 'lucide-react';

interface BabItem {
  id: string;
  icon: string;
  color: string;
  video_id: string | null;
  video_title_id: string | null;
  video_title_en: string | null;
  hotspotted: string | null;
  created_at: string;
  updated_at: string;
  // computed
  sub_count?: number;
  materi_count?: number;
}

const DEFAULT_FORM = {
  id: '',
  icon: '📚',
  color: '#6c5ce7',
  video_id: '',
  video_title_id: '',
  video_title_en: '',
  hotspotted: '',
};

export default function BabPage() {
  const [babList, setBabList] = useState<BabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<BabItem | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState<BabItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);

  const loadBab = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/bab');
      const data = await res.json();
      // Also count materi for each bab
      const resMateri = await fetch('/api/admin/materi');
      const materiData = await resMateri.json();
      const materiList = materiData.materi || [];

      const babWithCounts = (data.bab || []).map((b: BabItem) => ({
        ...b,
        sub_count: new Set(
          materiList
            .filter((m: { bab_id: string }) => m.bab_id === b.id)
            .map((m: { sub_bab_key: string }) => m.sub_bab_key)
        ).size,
        materi_count: materiList.filter((m: { bab_id: string }) => m.bab_id === b.id).length,
      }));

      setBabList(babWithCounts);
    } catch {
      showToast('Gagal memuat data bab');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBab();
  }, [loadBab]);

  const handleAdd = () => {
    setEditing(null);
    setForm({ ...DEFAULT_FORM });
    setShowEditor(true);
  };

  const handleEdit = (item: BabItem) => {
    setEditing(item);
    setForm({
      id: item.id,
      icon: item.icon || '📚',
      color: item.color || '#6c5ce7',
      video_id: item.video_id || '',
      video_title_id: item.video_title_id || '',
      video_title_en: item.video_title_en || '',
      hotspotted: item.hotspotted || '',
    });
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!form.id.trim()) {
      showToast('ID Bab wajib diisi');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        id: form.id.trim().toLowerCase().replace(/\s+/g, '-'),
        icon: form.icon,
        color: form.color,
        video_id: form.video_id || null,
        video_title_id: form.video_title_id || null,
        video_title_en: form.video_title_en || null,
        hotspotted: form.hotspotted || null,
      };

      const res = await fetch('/api/admin/bab', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed');
      }

      showToast(editing ? 'Bab berhasil diupdate!' : 'Bab berhasil ditambahkan!');
      setShowEditor(false);
      loadBab();
    } catch (e) {
      showToast(`Gagal menyimpan bab: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/admin/bab?id=${deleting.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      showToast('Bab berhasil dihapus!');
      setShowDelete(false);
      setDeleting(null);
      loadBab();
    } catch {
      showToast('Gagal menghapus bab');
    }
  };

  const ICONS = ['🔬', '🍽️', '🌿', '🧬', '🦎', '🌱', '🫀', '🦠', '📚', '🧪', '🔬', '🧫', '🧮', '📐', '🌍', '🔬'];
  const COLORS = ['#6c5ce7', '#00b894', '#00cec9', '#e17055', '#fdcb6e', '#55a3f5', '#ff7675', '#a29bfe', '#636e72', '#74b9ff'];

  const columns: Column<BabItem>[] = [
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
      key: 'sub_count',
      label: 'Sub Bab',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-semibold">
          <FileText className="w-3 h-3" />
          {row.sub_count || 0}
        </span>
      ),
    },
    {
      key: 'materi_count',
      label: 'Materi',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold">
          <BookOpen className="w-3 h-3" />
          {row.materi_count || 0}
        </span>
      ),
    },
    {
      key: 'video_title_id',
      label: 'Video',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-sm text-muted">
          {row.video_id ? (
            <>
              <Video className="w-3.5 h-3.5 text-red-500" />
              <span className="truncate max-w-[200px]">{row.video_title_id || row.video_id}</span>
            </>
          ) : (
            <span className="text-xs italic">Tidak ada</span>
          )}
        </div>
      ),
    },
    {
      key: 'updated_at',
      label: 'Terakhir Diubah',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-muted">
          {row.updated_at ? new Date(row.updated_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Manajemen Bab"
        description="Kelola bab dan sub-bab materi pembelajaran"
        action={{
          label: 'Tambah Bab',
          onClick: handleAdd,
        }}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{babList.length}</p>
          <p className="text-xs text-muted mt-1">Total Bab</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">
            {babList.reduce((a, b) => a + (b.sub_count || 0), 0)}
          </p>
          <p className="text-xs text-muted mt-1">Total Sub Bab</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">
            {babList.filter((b) => b.video_id).length}
          </p>
          <p className="text-xs text-muted mt-1">Dengan Video</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">
            {babList.reduce((a, b) => a + (b.materi_count || 0), 0)}
          </p>
          <p className="text-xs text-muted mt-1">Total Materi</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={babList as any}
        loading={loading}
        searchPlaceholder="Cari bab..."
        searchKeys={['id', 'video_title_id']}
        emptyMessage="Belum ada bab. Klik 'Tambah Bab' untuk menambahkan."
        actions={(row) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleEdit(row)}
              className="p-1.5 rounded-lg hover:bg-blue-500/10 text-muted hover:text-blue-500 transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setDeleting(row); setShowDelete(true); }}
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors"
              title="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Editor Modal */}
      <Modal open={showEditor} onClose={() => setShowEditor(false)} title={editing ? `Edit Bab: ${editing.id}` : 'Tambah Bab'} size="lg">
        <div className="space-y-4">
          {/* ID */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">ID Bab</label>
            <input
              type="text"
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              placeholder="contoh: sel, pencernaan, ekosistem"
              disabled={!!editing}
              className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-muted mt-1">ID unik untuk bab ini (tidak bisa diubah setelah dibuat)</p>
          </div>

          {/* Icon + Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Ikon</label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setForm({ ...form, icon })}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl border-2 transition-colors ${
                      form.icon === icon ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Warna</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={`w-10 h-10 rounded-lg border-2 transition-colors ${
                      form.color === color ? 'border-ink scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Video */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Video ID (YouTube)</label>
              <input
                type="text"
                value={form.video_id}
                onChange={(e) => setForm({ ...form, video_id: e.target.value })}
                placeholder="dQw4w9WgXcQ"
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Hotspotted</label>
              <input
                type="text"
                value={form.hotspotted}
                onChange={(e) => setForm({ ...form, hotspotted: e.target.value })}
                placeholder="ID bab terkait"
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Judul Video (ID)</label>
              <input
                type="text"
                value={form.video_title_id}
                onChange={(e) => setForm({ ...form, video_title_id: e.target.value })}
                placeholder="Judul video dalam bahasa Indonesia"
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Judul Video (EN)</label>
              <input
                type="text"
                value={form.video_title_en}
                onChange={(e) => setForm({ ...form, video_title_en: e.target.value })}
                placeholder="Video title in English"
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-bg-alt rounded-xl p-4 border border-border">
            <p className="text-xs text-muted mb-2">Preview:</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{form.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: form.color }} />
                  <span className="font-semibold text-ink capitalize">{form.id || '...'}</span>
                </div>
                {form.video_title_id && (
                  <p className="text-xs text-muted mt-0.5">🎬 {form.video_title_id}</p>
                )}
              </div>
            </div>
          </div>

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
        title="Hapus Bab"
        message={`Yakin ingin menghapus bab "${deleting?.id}"? Semua materi di bab ini juga akan terhapus. Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
