'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { Modal, ConfirmDialog } from '@/components/admin/modal';
import { showToast } from '@/components/ui/toaster';
import { Megaphone, Plus, Edit3, Trash2, Pin, PinOff, Bell, Calendar, Clock, Loader2 } from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  body: string;
  pinned: boolean;
  status: 'draft' | 'published';
  category: string;
  icon: string;
  bab_id: string | null;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}

const CATEGORY_OPTIONS = [
  { value: 'info', label: 'ℹ️ Info', color: 'bg-blue-500/10 text-blue-500' },
  { value: 'new_feature', label: '✨ Fitur Baru', color: 'bg-purple-500/10 text-purple-500' },
  { value: 'new_content', label: '📚 Materi Baru', color: 'bg-green-500/10 text-green-500' },
  { value: 'maintenance', label: '🔧 Maintenance', color: 'bg-gray-500/10 text-gray-500' },
  { value: 'urgent', label: '⚠️ Penting', color: 'bg-red-500/10 text-red-500' },
];

const ICON_OPTIONS = ['📣', '🎉', '✨', '🚀', '📚', '🦠', '🔔', '⚠️', '🔧', '💡', '🎯', '🏆'];

const BAB_OPTIONS = [
  { id: '', label: '— Tidak terkait bab —' },
  { id: 'bakteri', label: '🦠 Bakteri' },
];

const DEFAULT_FORM = {
  title: '',
  body: '',
  status: 'published' as 'draft' | 'published',
  pinned: false,
  category: 'info',
  icon: '📣',
  bab_id: '',
  starts_at: '',
  ends_at: '',
};

export default function PengumumanPage() {
  const [data, setData] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState<Announcement | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [babList, setBabList] = useState<Array<{ id: string; icon?: string }>>([]);

  // Load BAB list for the BAB picker (admin includes archived so we can target any)
  const loadBabList = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/bab');
      const data = await res.json();
      setBabList(data.bab || []);
    } catch {
      // Soft fail — still allow announcement creation without bab_id
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/announcements?admin=true', { cache: 'no-store' });
      const json = await res.json();
      setData(json.announcements || []);
    } catch {
      showToast('Gagal memuat daftar pengumuman');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadBabList();
  }, [loadData, loadBabList]);

  const handleAdd = () => {
    setSelected(null);
    setForm(DEFAULT_FORM);
    setShowModal(true);
  };

  const handleEdit = (item: Announcement) => {
    setSelected(item);
    setForm({
      title: item.title || '',
      body: item.body || '',
      status: item.status || 'published',
      pinned: !!item.pinned,
      category: item.category || 'info',
      icon: item.icon || '📣',
      bab_id: item.bab_id || '',
      starts_at: item.starts_at ? item.starts_at.slice(0, 16) : '',
      ends_at: item.ends_at ? item.ends_at.slice(0, 16) : '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      showToast('Judul dan isi wajib diisi');
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        body: form.body.trim(),
        status: form.status,
        pinned: form.pinned,
        category: form.category,
        icon: form.icon,
        bab_id: form.bab_id || null,
        starts_at: form.starts_at || null,
        ends_at: form.ends_at || null,
      };

      let res: Response;
      if (selected) {
        payload.id = selected.id;
        res = await fetch('/api/announcements', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed');
      }

      showToast(
        selected
          ? `Pengumuman "${form.title}" berhasil diupdate!`
          : `📢 Pengumuman "${form.title}" dibuat${form.pinned ? ' & dipin' : ''}. User akan melihat ${form.status === 'published' ? 'langsung' : 'setelah dipublikasi'} via bell icon.`
      );
      setShowModal(false);
      loadData();
    } catch (e) {
      showToast(`Gagal menyimpan: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePinned = async (item: Announcement) => {
    try {
      const res = await fetch('/api/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, pinned: !item.pinned }),
      });
      if (!res.ok) throw new Error('Failed');
      showToast(!item.pinned ? `📌 "${item.title}" dipin ke atas.` : `📌 "${item.title}" dilepas dari pin.`);
      loadData();
    } catch (e) {
      showToast(`Gagal: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const res = await fetch(`/api/announcements?id=${selected.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      showToast(`Pengumuman "${selected.title}" dihapus.`);
      setShowDelete(false);
      setSelected(null);
      loadData();
    } catch {
      showToast('Gagal menghapus pengumuman');
    }
  };

  const columns: Column<Announcement>[] = [
    {
      key: 'icon',
      label: '',
      render: (row) => <span className="text-xl">{row.icon}</span>,
      className: 'w-12',
    },
    {
      key: 'title',
      label: 'Judul',
      sortable: true,
      render: (row) => (
        <div>
          <div className="flex items-center gap-2">
            {row.pinned && <Pin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
            <span className={`font-medium text-ink ${row.status === 'draft' ? 'opacity-60' : ''}`}>{row.title}</span>
          </div>
          <span className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
            CATEGORY_OPTIONS.find((c) => c.value === row.category)?.color || 'bg-gray-500/10 text-gray-500'
          }`}>
            {CATEGORY_OPTIONS.find((c) => c.value === row.category)?.label || row.category}
          </span>
        </div>
      ),
    },
    {
      key: 'body',
      label: 'Isi',
      render: (row) => (
        <p className="text-sm text-muted truncate max-w-[350px]">{row.body}</p>
      ),
    },
    {
      key: 'pinned',
      label: 'Pin',
      className: 'w-20',
      render: (row) => (
        <button
          onClick={() => handleTogglePinned(row)}
          className={`p-1.5 rounded-lg transition-colors ${row.pinned ? 'bg-amber-500/15 text-amber-600 hover:bg-amber-500/25' : 'text-muted hover:bg-bg-alt'}`}
          title={row.pinned ? 'Lepas pin' : 'Pin ke atas'}
        >
          {row.pinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
        </button>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      className: 'w-32',
      render: (row) => (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
            row.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'published' ? 'bg-green-500' : 'bg-gray-400'}`} />
          {row.status === 'published' ? 'Dipublikasi' : 'Draft'}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Tanggal',
      sortable: true,
      className: 'w-32',
      render: (row) => {
        const d = row.created_at ? new Date(row.created_at) : null;
        return (
          <span className="text-xs text-muted inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {d ? d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
          </span>
        );
      },
    },
  ];

  // Stats summary
  const stats = {
    total: data.length,
    published: data.filter((a) => a.status === 'published').length,
    draft: data.filter((a) => a.status === 'draft').length,
    pinned: data.filter((a) => a.pinned && a.status === 'published').length,
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pengumuman"
        description="Kelola pengumuman untuk siswa & guru. Ditampilkan via bell icon di header user."
        action={{ label: 'Buat Pengumuman', onClick: handleAdd, icon: <Plus className="w-4 h-4" /> }}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{stats.total}</p>
          <p className="text-xs text-muted mt-1">Total</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-green-600">{stats.published}</p>
          <p className="text-xs text-muted mt-1">Dipublikasi</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-amber-600">{stats.pinned}</p>
          <p className="text-xs text-muted mt-1">📌 Dipin</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-muted">{stats.draft}</p>
          <p className="text-xs text-muted mt-1">Draft</p>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          searchPlaceholder="Cari pengumuman..."
          searchKeys={['title', 'body', 'category']}
          emptyMessage="Belum ada pengumuman. Klik 'Buat Pengumuman' untuk menambahkan."
          actions={(row) => (
            <div className="flex items-center gap-1">
              <button onClick={() => handleEdit(row)} className="p-1.5 rounded-lg hover:bg-bg-alt text-muted hover:text-accent transition-colors" title="Edit">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => { setSelected(row); setShowDelete(true); }} className="p-1.5 rounded-lg hover:bg-bg-alt text-red transition-colors" title="Hapus">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
      </div>

      {/* ── Editor Modal ─────────────────────────────────── */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={selected ? `Edit: ${selected.title}` : 'Buat Pengumuman Baru'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Judul <span className="text-red">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="contoh: Materi BAB Bakteri sudah tersedia!"
              className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Isi Pengumuman <span className="text-red">*</span></label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Tulis pengumuman lengkap untuk user…"
              rows={5}
              className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
            />
            <p className="text-xs text-muted mt-1">Plain text. Bisa multiple baris.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">Ikon</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setForm({ ...form, icon: ic })}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl border-2 transition-colors ${
                    form.icon === ic ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/30'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-2">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm({ ...form, category: c.value })}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-colors ${
                    form.category === c.value ? `border-accent ${c.color}` : 'border-border bg-surface text-muted hover:border-accent/30'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {(babList.length > 0 || BAB_OPTIONS.length > 1) && (
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Tautkan ke BAB (opsional)</label>
              <select
                value={form.bab_id}
                onChange={(e) => setForm({ ...form, bab_id: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="">— Tidak terkait BAB tertentu —</option>
                {(babList.length > 0
                  ? babList.map((b) => ({ id: b.id, label: `${b.icon || '📚'} ${b.id}` }))
                  : BAB_OPTIONS.filter((b) => b.id)
                ).map((b) => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
              <p className="text-xs text-muted mt-1">User dapat diarahkan ke BAB terkait dari bell modal.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Mulai Tampil</label>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Berakhir</label>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as 'published' | 'draft' })}
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="published">📢 Dipublikasi</option>
                <option value="draft">📝 Draft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Pin</label>
              <button
                onClick={() => setForm({ ...form, pinned: !form.pinned })}
                className={`w-full px-3 py-2 border rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  form.pinned ? 'border-amber-500 bg-amber-500/10 text-amber-700' : 'border-border bg-surface text-muted hover:border-amber-500/30'
                }`}
              >
                {form.pinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
                {form.pinned ? 'Dipin ke atas' : 'Sematkan?'}
              </button>
            </div>
          </div>

          <div className="bg-bg-alt/60 rounded-xl p-3 border border-border/60">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-muted" />
              <span className="text-xs font-semibold text-muted">Preview di bell user:</span>
            </div>
            <div className="flex items-start gap-3 p-3 bg-surface rounded-xl border border-border">
              <span className="text-2xl flex-shrink-0">{form.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-ink truncate">{form.title || 'Judul pengumuman'}</span>
                  {form.pinned && <Pin className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                </div>
                <p className="text-xs text-muted line-clamp-2">{form.body || 'Isi pengumuman...'}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm border border-border rounded-xl hover:bg-bg-alt transition-colors">Batal</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm bg-accent text-white rounded-xl hover:bg-accent-dark transition-colors font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
              {saving ? 'Menyimpan...' : (selected ? 'Update' : 'Publikasikan')}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Pengumuman"
        message={`Yakin ingin menghapus pengumuman "${selected?.title}"? User tidak akan melihatnya lagi di bell.`}
        variant="danger"
      />
    </div>
  );
}
