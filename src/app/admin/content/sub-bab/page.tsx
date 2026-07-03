'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { Modal, ConfirmDialog } from '@/components/admin/modal';
import { showToast } from '@/components/ui/toaster';
import { ImageUpload } from '@/components/admin/image-upload';
import { BAB } from '@/lib/bab-data';
import {
  FileText, Edit, Trash2, Save, Loader2, Video, Image as ImageIcon,
  Layers, Sparkles, X, Plus,
} from 'lucide-react';

interface SubBabItem {
  id: number;
  bab_id: string;
  sub_bab_key: string;
  title_id: string;
  title_en: string;
  summary_id: string;
  summary_en: string;
  content_id: string;
  content_en: string;
  video_url: string;
  image_url: string;
  animation_url: string;
  animation_type: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

type TabKey = 'ringkasan' | 'konten' | 'media';

export default function SubBabPage() {
  const [items, setItems] = useState<SubBabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBab, setFilterBab] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<SubBabItem | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState<SubBabItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('ringkasan');

  const [form, setForm] = useState({
    bab_id: '',
    sub_bab_key: '',
    title_id: '',
    title_en: '',
    summary_id: '',
    summary_en: '',
    content_id: '',
    content_en: '',
    video_url: '',
    image_url: '',
    animation_url: '',
    animation_type: '',
    sort_order: 0,
  });

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterBab ? `/api/admin/sub-bab?bab_id=${filterBab}` : '/api/admin/sub-bab';
      const res = await fetch(url);
      const data = await res.json();
      setItems(data.sub_bab || []);
    } catch {
      showToast('Gagal memuat data sub-bab');
    } finally {
      setLoading(false);
    }
  }, [filterBab]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const handleAdd = () => {
    setEditing(null);
    const currentBab = filterBab || BAB[0]?.id || '';
    const existingKeys = items.filter((i) => i.bab_id === currentBab).map((i) => i.sub_bab_key);
    const nextIdx = existingKeys.length + 1;
    setForm({
      bab_id: currentBab,
      sub_bab_key: `sub.${currentBab}${nextIdx}`,
      title_id: '',
      title_en: '',
      summary_id: '',
      summary_en: '',
      content_id: '',
      content_en: '',
      video_url: '',
      image_url: '',
      animation_url: '',
      animation_type: '',
      sort_order: nextIdx,
    });
    setActiveTab('ringkasan');
    setShowEditor(true);
  };

  const handleEdit = (item: SubBabItem) => {
    setEditing(item);
    setForm({
      bab_id: item.bab_id,
      sub_bab_key: item.sub_bab_key || '',
      title_id: item.title_id || '',
      title_en: item.title_en || '',
      summary_id: item.summary_id || '',
      summary_en: item.summary_en || '',
      content_id: item.content_id || '',
      content_en: item.content_en || '',
      video_url: item.video_url || '',
      image_url: item.image_url || '',
      animation_url: item.animation_url || '',
      animation_type: item.animation_type || '',
      sort_order: item.sort_order || 0,
    });
    setActiveTab('ringkasan');
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!form.title_id.trim()) return showToast('Judul (ID) wajib diisi');
    setSaving(true);
    try {
      const payload = {
        ...(editing ? { id: editing.id } : {}),
        ...form,
      };
      const res = await fetch('/api/admin/sub-bab', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed');
      showToast(editing ? 'Sub-bab berhasil diupdate!' : 'Sub-bab berhasil ditambahkan!');
      setShowEditor(false);
      loadItems();
    } catch {
      showToast('Gagal menyimpan sub-bab');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/admin/sub-bab?id=${deleting.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      showToast('Sub-bab berhasil dihapus!');
      setShowDelete(false);
      setDeleting(null);
      loadItems();
    } catch {
      showToast('Gagal menghapus sub-bab');
    }
  };

  const columns: Column<SubBabItem>[] = [
    {
      key: 'bab_id',
      label: 'Bab',
      sortable: true,
      render: (row) => {
        const bab = BAB.find((b) => b.id === row.bab_id);
        return (
          <span className="flex items-center gap-2">
            <span>{bab?.icon || '📚'}</span>
            <span className="font-medium">{bab?.id || row.bab_id}</span>
          </span>
        );
      },
    },
    {
      key: 'sub_bab_key',
      label: 'Key',
      sortable: true,
      render: (row) => (
        <code className="text-xs px-2 py-0.5 rounded bg-bg-alt text-muted font-mono">
          {row.sub_bab_key}
        </code>
      ),
    },
    {
      key: 'title_id',
      label: 'Judul',
      sortable: true,
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-ink truncate max-w-[200px]">{row.title_id}</p>
          {row.title_en && (
            <p className="text-xs text-muted truncate max-w-[200px]">{row.title_en}</p>
          )}
        </div>
      ),
    },
    {
      key: 'summary_id',
      label: 'Ringkasan',
      render: (row) => (
        <span className="text-xs text-muted max-w-[150px] truncate block">
          {row.summary_id ? row.summary_id.substring(0, 50) + '...' : '—'}
        </span>
      ),
    },
    {
      key: 'video_url',
      label: 'Media',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.video_url && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px]">
              <Video className="w-2.5 h-2.5" /> Video
            </span>
          )}
          {row.image_url && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-green/10 text-green text-[10px]">
              <ImageIcon className="w-2.5 h-2.5" /> Gambar
            </span>
          )}
          {row.animation_url && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500 text-[10px]">
              <Sparkles className="w-2.5 h-2.5" /> Animasi
            </span>
          )}
          {!row.video_url && !row.image_url && !row.animation_url && (
            <span className="text-xs text-muted italic">Kosong</span>
          )}
        </div>
      ),
    },
    {
      key: 'sort_order',
      label: 'Urutan',
      sortable: true,
    },
  ];

  const tabs: { key: TabKey; label: string; icon: typeof FileText }[] = [
    { key: 'ringkasan', label: 'Ringkasan', icon: FileText },
    { key: 'konten', label: 'Konten Lengkap', icon: Layers },
    { key: 'media', label: 'Media', icon: Video },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sub Bab"
        description="Kelola konten sub-bab per materi"
        action={{ label: 'Tambah Sub Bab', onClick: handleAdd }}
      />

      {/* Filter Bab */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterBab('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            !filterBab
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
        data={items as any}
        loading={loading}
        searchPlaceholder="Cari sub-bab..."
        searchKeys={['title_id', 'title_en', 'sub_bab_key', 'bab_id']}
        emptyMessage="Belum ada sub-bab. Klik 'Tambah Sub Bab' untuk menambahkan."
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
        title={editing ? `Edit: ${editing.title_id}` : 'Tambah Sub Bab'}
        size="xl"
      >
        <div className="space-y-4">
          {/* Bab & Key & Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Bab</label>
              <select
                value={form.bab_id}
                onChange={(e) => setForm({ ...form, bab_id: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                {BAB.map((bab) => (
                  <option key={bab.id} value={bab.id}>
                    {bab.icon} {bab.id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Sub Bab Key</label>
              <input
                type="text"
                value={form.sub_bab_key}
                onChange={(e) => setForm({ ...form, sub_bab_key: e.target.value })}
                placeholder="sub.sel1"
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Urutan</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          {/* Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Judul (ID) <span className="text-red">*</span>
              </label>
              <input
                type="text"
                value={form.title_id}
                onChange={(e) => setForm({ ...form, title_id: e.target.value })}
                placeholder="Teori Sel"
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Judul (EN)</label>
              <input
                type="text"
                value={form.title_en}
                onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                placeholder="Cell Theory"
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <nav className="flex gap-1 -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? 'border-accent text-accent'
                        : 'border-transparent text-muted hover:text-ink hover:border-border'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content: Ringkasan */}
          {activeTab === 'ringkasan' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">🇮🇩 Ringkasan (ID)</label>
                <textarea
                  value={form.summary_id}
                  onChange={(e) => setForm({ ...form, summary_id: e.target.value })}
                  rows={4}
                  placeholder="Ringkasan singkat materi sub-bab ini..."
                  className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">🇬🇧 Ringkasan (EN)</label>
                <textarea
                  value={form.summary_en}
                  onChange={(e) => setForm({ ...form, summary_en: e.target.value })}
                  rows={4}
                  placeholder="Short summary of this sub-chapter..."
                  className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
                />
              </div>
            </div>
          )}

          {/* Tab Content: Konten Lengkap */}
          {activeTab === 'konten' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">🇮🇩 Konten Lengkap (ID) — HTML</label>
                <textarea
                  value={form.content_id}
                  onChange={(e) => setForm({ ...form, content_id: e.target.value })}
                  rows={10}
                  placeholder='<h3>Judul</h3><p>Isi materi lengkap dalam HTML...</p>'
                  className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
                />
                <p className="text-xs text-muted mt-1">
                  Gunakan HTML untuk formatting. Contoh: &lt;h3&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">🇬🇧 Konten Lengkap (EN) — HTML</label>
                <textarea
                  value={form.content_en}
                  onChange={(e) => setForm({ ...form, content_en: e.target.value })}
                  rows={10}
                  placeholder='<h3>Title</h3><p>Full content in English HTML...</p>'
                  className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
                />
              </div>
              {/* Preview */}
              {form.content_id && (
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Preview (ID)</label>
                  <div
                    className="p-4 border border-border rounded-xl bg-bg-alt prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: form.content_id }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Media */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  <Video className="w-4 h-4 inline mr-1" />
                  URL Video
                </label>
                <input
                  type="text"
                  value={form.video_url}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
                <p className="text-xs text-muted mt-1">YouTube, Vimeo, atau URL video lainnya</p>
              </div>

              {/* Image Upload */}
              <ImageUpload
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
                folder="sub-bab"
                label="🖼️ Gambar Sub Bab"
                placeholder="URL gambar atau upload file"
              />

              {/* Animation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    URL Animasi
                  </label>
                  <input
                    type="text"
                    value={form.animation_url}
                    onChange={(e) => setForm({ ...form, animation_url: e.target.value })}
                    placeholder="https://... (H5P, Lottie, dll)"
                    className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Tipe Animasi</label>
                  <select
                    value={form.animation_type}
                    onChange={(e) => setForm({ ...form, animation_type: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  >
                    <option value="">Pilih tipe...</option>
                    <option value="h5p">H5P Interactive</option>
                    <option value="lottie">Lottie Animation</option>
                    <option value="iframe">Iframe Embed</option>
                    <option value="gif">GIF</option>
                    <option value="svg">SVG Animation</option>
                  </select>
                </div>
              </div>

              {/* Media Preview */}
              {(form.video_url || form.image_url || form.animation_url) && (
                <div className="bg-bg-alt rounded-xl border border-border p-4">
                  <label className="block text-xs font-medium text-muted mb-3">Preview Media</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {form.video_url && (
                      <div className="p-3 bg-surface rounded-lg border border-border">
                        <Video className="w-5 h-5 text-blue-500 mb-1" />
                        <p className="text-xs text-ink font-medium">Video</p>
                        <p className="text-[10px] text-muted truncate">{form.video_url}</p>
                      </div>
                    )}
                    {form.image_url && (
                      <div className="p-3 bg-surface rounded-lg border border-border">
                        <ImageIcon className="w-5 h-5 text-green mb-1" />
                        <p className="text-xs text-ink font-medium">Gambar</p>
                        <img
                          src={form.image_url}
                          alt="Preview"
                          className="mt-1 max-h-16 rounded object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    {form.animation_url && (
                      <div className="p-3 bg-surface rounded-lg border border-border">
                        <Sparkles className="w-5 h-5 text-purple-500 mb-1" />
                        <p className="text-xs text-ink font-medium">Animasi ({form.animation_type || 'N/A'})</p>
                        <p className="text-[10px] text-muted truncate">{form.animation_url}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

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
        title="Hapus Sub Bab"
        message={`Yakin ingin menghapus sub-bab "${deleting?.title_id}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
