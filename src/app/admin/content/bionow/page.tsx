'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { showToast } from '@/components/ui/toaster';
import { TranslateButton } from '@/components/admin/translate-button';
import { ImageUpload } from '@/components/admin/image-upload';
import { Modal, ConfirmDialog } from '@/components/admin/modal';
import { BAB } from '@/lib/bab-data';
import {
  Newspaper, Plus, Trash2, Save, Loader2, Edit3, Eye, EyeOff,
} from 'lucide-react';
import { adminFetch } from "@/lib/admin-fetch";

interface BioNowPost {
  id?: number;
  slug: string;
  badge: string;
  title_id: string;
  title_en: string;
  summary_id: string;
  summary_en: string;
  body_id: string;
  body_en: string;
  infographic_url: string;
  infographic_caption_id: string;
  infographic_caption_en: string;
  bab_id: string;
  sub_bab_key: string;
  tags: string[];
  published: boolean;
  sort_order: number;
}

const EMPTY_POST: BioNowPost = {
  slug: '',
  badge: 'Isu Terkini',
  title_id: '',
  title_en: '',
  summary_id: '',
  summary_en: '',
  body_id: '',
  body_en: '',
  infographic_url: '',
  infographic_caption_id: '',
  infographic_caption_en: '',
  bab_id: '',
  sub_bab_key: '',
  tags: [],
  published: false,
  sort_order: 0,
};

const inputCls = "w-full px-3 py-2 border border-border rounded-xl bg-bg-alt text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30";

export default function BioNowAdminPage() {
  const [posts, setPosts] = useState<BioNowPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<BioNowPost | null>(null);
  const [form, setForm] = useState<BioNowPost>(EMPTY_POST);
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState<BioNowPost | null>(null);

  const refreshPosts = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/bionow');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      showToast('Gagal memuat BioNow');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    adminFetch('/api/admin/bionow')
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        showToast('Gagal memuat BioNow');
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_POST, sort_order: posts.length + 1 });
    setTagsInput('');
    setShowEditor(true);
  };

  const openEdit = (p: BioNowPost) => {
    setEditing(p);
    setForm({ ...p, tags: p.tags || [] });
    setTagsInput((p.tags || []).join(', '));
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!form.title_id.trim()) return showToast('Judul (ID) wajib diisi');
    setSaving(true);
    try {
      const payload = {
        ...(editing?.id ? { id: editing.id } : {}),
        ...form,
        tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      };
      const res = await adminFetch('/api/admin/bionow', {
        method: editing?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed');
      }
      showToast(editing?.id ? 'Post berhasil diupdate!' : 'Post berhasil ditambahkan!');
      setShowEditor(false);
      refreshPosts();
    } catch (e) {
      showToast(`Gagal menyimpan: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting?.id) return;
    try {
      await adminFetch(`/api/admin/bionow?id=${deleting.id}`, { method: 'DELETE' });
      showToast('Post berhasil dihapus');
      refreshPosts();
    } catch {
      showToast('Gagal menghapus post');
    } finally {
      setShowDelete(false);
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="BioNow"
        description="Kelola isu & fenomena dunia nyata yang terhubung ke materi"
        action={{ label: 'Tulis Post', onClick: openAdd, icon: <Plus className="w-4 h-4" /> }}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-sm text-muted">Memuat...</div>
      ) : posts.length === 0 ? (
        <div className="bg-surface rounded-xl border border-border p-10 text-center">
          <Newspaper className="w-10 h-10 text-muted mx-auto mb-3" />
          <p className="text-sm text-muted">Belum ada post. Klik “Tulis Post” untuk membuat yang pertama.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((p) => (
            <div key={p.id} className="bg-surface rounded-xl border border-border p-4 flex gap-3">
              {p.infographic_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.infographic_url} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-bg-alt flex items-center justify-center flex-shrink-0">
                  <Newspaper className="w-6 h-6 text-muted" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.published ? 'bg-green/10 text-green' : 'bg-border text-muted'}`}>
                    {p.published ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-[11px] text-muted truncate">/{p.slug}</span>
                </div>
                <p className="text-sm font-bold text-ink leading-snug line-clamp-2">{p.title_id}</p>
                <div className="flex items-center gap-1 mt-2">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-bg-alt text-muted hover:text-ink" title="Edit">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setDeleting(p); setShowDelete(true); }} className="p-1.5 rounded-lg hover:bg-red/5 text-muted hover:text-red" title="Hapus">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <Modal open={showEditor} onClose={() => setShowEditor(false)} title={editing?.id ? 'Edit Post BioNow' : 'Tulis Post BioNow'}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Slug (URL)</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="otomatis dari judul bila kosong" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Badge</label>
              <input type="text" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Isu Terkini" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1">Judul (ID) *</label>
            <input type="text" value={form.title_id} onChange={(e) => setForm({ ...form, title_id: e.target.value })} className={inputCls} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-ink">Judul (EN)</label>
              <TranslateButton source="id" target="en" text={form.title_id} onTranslated={(t) => setForm({ ...form, title_en: t })} />
            </div>
            <input type="text" value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1">Ringkasan (ID)</label>
            <textarea value={form.summary_id} onChange={(e) => setForm({ ...form, summary_id: e.target.value })} rows={2} className={`${inputCls} resize-y`} />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Ringkasan (EN)</label>
            <textarea value={form.summary_en} onChange={(e) => setForm({ ...form, summary_en: e.target.value })} rows={2} className={`${inputCls} resize-y`} />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1">Penjelasan Ilmiah (ID, HTML)</label>
            <textarea value={form.body_id} onChange={(e) => setForm({ ...form, body_id: e.target.value })} rows={6} placeholder="<h4>...</h4><p>...</p>" className={`${inputCls} resize-y font-mono`} />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink mb-1">Penjelasan Ilmiah (EN, HTML)</label>
            <textarea value={form.body_en} onChange={(e) => setForm({ ...form, body_en: e.target.value })} rows={6} className={`${inputCls} resize-y font-mono`} />
          </div>

          <ImageUpload value={form.infographic_url} onChange={(url) => setForm({ ...form, infographic_url: url })} folder="bionow" label="📊 Infografis (opsional)" placeholder="URL gambar atau upload" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Caption Infografis (ID)</label>
              <input type="text" value={form.infographic_caption_id} onChange={(e) => setForm({ ...form, infographic_caption_id: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Caption (EN)</label>
              <input type="text" value={form.infographic_caption_en} onChange={(e) => setForm({ ...form, infographic_caption_en: e.target.value })} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Tautkan ke Bab</label>
              <select value={form.bab_id} onChange={(e) => setForm({ ...form, bab_id: e.target.value })} className={inputCls}>
                <option value="">— Tidak ditautkan —</option>
                {BAB.map((b) => (
                  <option key={b.id} value={b.id}>{b.id}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Sub-bab Key (deep link)</label>
              <input type="text" value={form.sub_bab_key} onChange={(e) => setForm({ ...form, sub_bab_key: e.target.value })} placeholder="cth: sub.bakteri3" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Tags (pisahkan koma)</label>
              <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="antibiotik, bakteri" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink mb-1">Urutan</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className={inputCls} />
            </div>
          </div>

          <label className="flex items-center justify-between cursor-pointer border border-border rounded-xl px-3 py-2.5">
            <span className="text-xs font-medium text-ink inline-flex items-center gap-1.5">
              {form.published ? <Eye className="w-4 h-4 text-green" /> : <EyeOff className="w-4 h-4 text-muted" />}
              {form.published ? 'Published — tampil di /bionow' : 'Draft — belum tampil'}
            </span>
            <button
              type="button"
              onClick={() => setForm({ ...form, published: !form.published })}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.published ? 'bg-accent' : 'bg-border'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.published ? 'translate-x-5' : ''}`} />
            </button>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowEditor(false)} className="px-4 py-2 rounded-xl text-xs font-semibold border border-border text-muted hover:text-ink">
              Batal
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-xl text-xs font-semibold hover:bg-accent-dark disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {editing?.id ? 'Update' : 'Simpan'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={showDelete}
        onClose={() => { setShowDelete(false); setDeleting(null); }}
        onConfirm={handleDelete}
        title="Hapus Post"
        message={`Yakin ingin menghapus "${deleting?.title_id}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
