'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { Modal, ConfirmDialog } from '@/components/admin/modal';
import { showToast } from '@/components/ui/toaster';
import { ImageUpload } from '@/components/admin/image-upload';
import {
  FileText, Edit, Trash2, Save, Loader2, Video, Image as ImageIcon,
  Layers, Sparkles, Plus, Languages, Eye, EyeOff,
} from 'lucide-react';

interface BabItem { id: string; icon: string; color: string; kelas_id?: string; }

interface MateriBiologiItem {
  // From sub_bab table
  sub_bab_id: number | null;
  bab_id: string;
  sub_bab_key: string;
  title_id: string;
  title_en: string;
  // From materi table
  materi_id: number | null;
  type: string;
  content_id: string;
  content_en: string;
  summary_id: string;
  summary_en: string;
  // Media from sub_bab
  video_url: string;
  image_url: string;
  animation_url: string;
  animation_type: string;
  // Metadata from materi
  metadata: Record<string, unknown>;
  sort_order: number;
}

type TabKey = 'ringkasan' | 'konten' | 'media';

export default function MateriBiologiPage() {
  const [items, setItems] = useState<MateriBiologiItem[]>([]);
  const [babList, setBabList] = useState<BabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBab, setFilterBab] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<MateriBiologiItem | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState<MateriBiologiItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('ringkasan');
  const [translating, setTranslating] = useState<string | null>(null);

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
    type: 'html',
    sort_order: 0,
  });

  // Load merged data from both sub_bab and materi tables
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch bab list
      const resBab = await fetch('/api/admin/bab');
      const babData = await resBab.json();
      setBabList(babData.bab || []);

      // Fetch sub_bab (primary source)
      const subBabUrl = filterBab ? `/api/admin/sub-bab?bab_id=${filterBab}` : '/api/admin/sub-bab';
      const resSubBab = await fetch(subBabUrl);
      const subBabData = await resSubBab.json();
      const subBabList: Record<string, unknown>[] = subBabData.sub_bab || [];

      // Fetch materi (content source)
      const materiUrl = filterBab ? `/api/admin/materi?bab_id=${filterBab}` : '/api/admin/materi';
      const resMateri = await fetch(materiUrl);
      const materiData = await resMateri.json();
      const materiList: Record<string, unknown>[] = materiData.materi || [];

      // Merge: sub_bab is primary, materi enriches with content
      const merged: MateriBiologiItem[] = subBabList.map((sb) => {
        const key = (sb.key as string) || '';
        const materi = materiList.find((m) => m.sub_bab_key === key);
        const meta = materi ? ((materi.metadata as Record<string, unknown>) || {}) : {};

        return {
          sub_bab_id: sb.id as number,
          bab_id: sb.bab_id as string,
          sub_bab_key: key,
          title_id: (sb.title_id as string) || (meta.title_id as string) || '',
          title_en: (sb.title_en as string) || (meta.title_en as string) || '',
          materi_id: materi ? (materi.id as number) : null,
          type: (materi?.type as string) || 'html',
          content_id: (materi?.content_id as string) || (sb.content_id as string) || '',
          content_en: (materi?.content_en as string) || (sb.content_en as string) || '',
          summary_id: (materi?.summary_id as string) || (sb.summary_id as string) || '',
          summary_en: (materi?.summary_en as string) || (sb.summary_en as string) || '',
          video_url: (sb.video_url as string) || (meta.video_url as string) || '',
          image_url: (sb.image_url as string) || '',
          animation_url: (sb.animation_url as string) || '',
          animation_type: (sb.animation_type as string) || '',
          metadata: meta,
          sort_order: (sb.sort_order as number) || 0,
        };
      });

      // Also add materi entries that have NO matching sub_bab (orphan materi)
      const subBabKeys = new Set(subBabList.map((sb) => sb.key));
      const orphanMateri = materiList
        .filter((m) => !subBabKeys.has(m.sub_bab_key as string))
        .map((m) => {
          const meta = ((m.metadata as Record<string, unknown>) || {});
          return {
            sub_bab_id: null,
            bab_id: m.bab_id as string,
            sub_bab_key: (m.sub_bab_key as string) || '',
            title_id: (meta.title_id as string) || '',
            title_en: (meta.title_en as string) || '',
            materi_id: m.id as number,
            type: (m.type as string) || 'html',
            content_id: (m.content_id as string) || '',
            content_en: (m.content_en as string) || '',
            summary_id: (m.summary_id as string) || '',
            summary_en: (m.summary_en as string) || '',
            video_url: (meta.video_url as string) || '',
            image_url: '',
            animation_url: '',
            animation_type: '',
            metadata: meta,
            sort_order: (m.sort_order as number) || 0,
          };
        });

      setItems([...merged, ...orphanMateri]);
    } catch {
      showToast('Gagal memuat data materi biologi');
    } finally {
      setLoading(false);
    }
  }, [filterBab]);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-translate helper
  const translate = async (text: string, field: string, target: 'en' | 'id' = 'en') => {
    if (!text.trim()) return null;
    setTranslating(field);
    try {
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, from: target === 'en' ? 'id' : 'en', to: target }),
      });
      const data = await res.json();
      return data.translated;
    } catch {
      showToast('Gagal menerjemahkan');
      return null;
    } finally {
      setTranslating(null);
    }
  };

  const translateField = async (field: 'summary' | 'content' | 'title') => {
    const source = field === 'summary' ? form.summary_id : field === 'content' ? form.content_id : form.title_id;
    if (!source?.trim()) return showToast(`Isi ${field} dulu`);
    const translated = await translate(source, `${field}_translate`);
    if (translated) {
      const updates: Record<string, string> = {};
      if (field === 'summary') updates.summary_en = translated;
      else if (field === 'content') updates.content_en = translated;
      else updates.title_en = translated;
      setForm((prev) => ({ ...prev, ...updates }));
      showToast(`${field} diterjemahkan!`);
    }
  };

  const handleAdd = () => {
    setEditing(null);
    const currentBab = filterBab || babList[0]?.id || '';
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
      type: 'html',
      sort_order: nextIdx,
    });
    setActiveTab('ringkasan');
    setShowEditor(true);
  };

  const handleEdit = (item: MateriBiologiItem) => {
    setEditing(item);
    setForm({
      bab_id: item.bab_id,
      sub_bab_key: item.sub_bab_key,
      title_id: item.title_id,
      title_en: item.title_en,
      summary_id: item.summary_id,
      summary_en: item.summary_en,
      content_id: item.content_id,
      content_en: item.content_en,
      video_url: item.video_url,
      image_url: item.image_url,
      animation_url: item.animation_url,
      animation_type: item.animation_type,
      type: item.type,
      sort_order: item.sort_order,
    });
    setActiveTab('ringkasan');
    setShowEditor(true);
  };

  // Save to BOTH sub_bab AND materi tables
  const handleSave = async () => {
    if (!form.title_id.trim()) return showToast('Judul (ID) wajib diisi');
    setSaving(true);
    try {
      // 1. Save to sub_bab table
      const subBabPayload = {
        ...(editing?.sub_bab_id ? { id: editing.sub_bab_id } : {}),
        bab_id: form.bab_id,
        key: form.sub_bab_key,
        title_id: form.title_id,
        title_en: form.title_en,
        summary_id: form.summary_id,
        summary_en: form.summary_en,
        content_id: form.content_id,
        content_en: form.content_en,
        video_url: form.video_url,
        image_url: form.image_url,
        animation_url: form.animation_url,
        animation_type: form.animation_type,
        sort_order: form.sort_order,
      };

      const subBabRes = await fetch('/api/admin/sub-bab', {
        method: editing?.sub_bab_id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subBabPayload),
      });

      if (!subBabRes.ok) {
        const err = await subBabRes.json().catch(() => ({}));
        throw new Error(`Sub-bab: ${err.error || 'Failed'}`);
      }

      // Get the sub_bab ID (for new entries)
      let subBabId = editing?.sub_bab_id;
      if (!subBabId) {
        const subBabResult = await subBabRes.json();
        subBabId = subBabResult.id;
      }

      // 2. Save to materi table (upsert by sub_bab_key)
      // IMPORTANT: media fields are stored both in sub_bab (dedicated cols)
      // AND metadata JSONB (backup for legacy consumers like /api/content)
      const materiPayload = {
        ...(editing?.materi_id ? { id: editing.materi_id } : {}),
        bab_id: form.bab_id,
        sub_bab_key: form.sub_bab_key,
        type: form.type,
        content_id: form.content_id,
        content_en: form.content_en,
        summary_id: form.summary_id,
        summary_en: form.summary_en,
        sort_order: form.sort_order,
        metadata: {
          title_id: form.title_id,
          title_en: form.title_en,
          video_url: form.video_url,
          image_url: form.image_url,
          animation_url: form.animation_url,
          animation_type: form.animation_type,
        },
      };

      const materiRes = await fetch('/api/admin/materi', {
        method: editing?.materi_id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(materiPayload),
      });

      if (!materiRes.ok) {
        const err = await materiRes.json().catch(() => ({}));
        throw new Error(`Materi: ${err.error || 'Failed'}`);
      }

      showToast(editing ? 'Materi biologi berhasil diupdate!' : 'Materi biologi berhasil ditambahkan!');
      setShowEditor(false);
      loadData();
    } catch (e) {
      showToast(`Gagal menyimpan: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally {
      setSaving(false);
    }
  };

  // Delete from BOTH tables
  const handleDelete = async () => {
    if (!deleting) return;
    try {
      // Delete from sub_bab if exists
      if (deleting.sub_bab_id) {
        await fetch(`/api/admin/sub-bab?id=${deleting.sub_bab_id}`, { method: 'DELETE' });
      }
      // Delete from materi if exists
      if (deleting.materi_id) {
        await fetch(`/api/admin/materi?id=${deleting.materi_id}`, { method: 'DELETE' });
      }
      showToast('Materi biologi berhasil dihapus!');
      setShowDelete(false);
      setDeleting(null);
      loadData();
    } catch {
      showToast('Gagal menghapus materi biologi');
    }
  };

  const columns: Column<MateriBiologiItem>[] = [
    {
      key: 'bab_id',
      label: 'Bab',
      sortable: true,
      render: (row) => {
        const bab = babList.find((b) => b.id === row.bab_id);
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
          <p className="text-sm font-medium text-ink truncate max-w-[200px]">{row.title_id || '—'}</p>
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
      key: 'content_id',
      label: 'Konten',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.content_id ? (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-green/10 text-green text-[10px]">
              <FileText className="w-2.5 h-2.5" /> Ada
            </span>
          ) : (
            <span className="text-xs text-muted italic">Kosong</span>
          )}
          {row.materi_id && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[10px]">
              {row.type}
            </span>
          )}
        </div>
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
        title="Materi Biologi"
        description="Kelola sub-bab, konten, ringkasan, dan media pembelajaran biologi secara terpadu"
        action={{ label: 'Tambah Materi', onClick: handleAdd }}
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
        {babList.map((bab) => (
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{items.length}</p>
          <p className="text-xs text-muted mt-1">Total Sub-Bab</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{items.filter((i) => i.content_id).length}</p>
          <p className="text-xs text-muted mt-1">Ada Konten</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{items.filter((i) => i.summary_id).length}</p>
          <p className="text-xs text-muted mt-1">Ada Ringkasan</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-ink">{items.filter((i) => i.video_url || i.image_url || i.animation_url).length}</p>
          <p className="text-xs text-muted mt-1">Ada Media</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={items as any}
        loading={loading}
        searchPlaceholder="Cari materi biologi..."
        searchKeys={['title_id', 'title_en', 'sub_bab_key', 'bab_id']}
        emptyMessage="Belum ada materi biologi. Klik 'Tambah Materi' untuk menambahkan."
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
              onClick={() => { setDeleting(row); setShowDelete(true); }}
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
        title={editing ? `Edit: ${editing.title_id || editing.sub_bab_key}` : 'Tambah Materi Biologi'}
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
                {babList.map((bab) => (
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
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-ink mb-1">Judul (EN)</label>
                <button
                  onClick={() => translateField('title')}
                  disabled={translating === 'title_translate'}
                  className="text-xs text-blue-500 hover:text-blue-700 disabled:opacity-50"
                >
                  {translating === 'title_translate' ? <Loader2 className="w-3 h-3 animate-spin inline" /> : <Languages className="w-3 h-3 inline mr-0.5" />}
                  Auto
                </button>
              </div>
              <input
                type="text"
                value={form.title_en}
                onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                placeholder="Cell Theory"
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          {/* Tipe Konten */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Tipe Konten</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="html">HTML / Teks</option>
              <option value="video">Video</option>
              <option value="animation">Animasi</option>
              <option value="image">Gambar</option>
            </select>
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

          {/* Tab: Ringkasan */}
          {activeTab === 'ringkasan' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-ink">🇮🇩 Ringkasan (ID)</label>
                  <button
                    onClick={() => translateField('summary')}
                    disabled={translating === 'summary_translate'}
                    className="text-xs text-blue-500 hover:text-blue-700 disabled:opacity-50"
                  >
                    {translating === 'summary_translate' ? <Loader2 className="w-3 h-3 animate-spin inline" /> : <Languages className="w-3 h-3 inline mr-0.5" />}
                    Auto Translate
                  </button>
                </div>
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

          {/* Tab: Konten Lengkap */}
          {activeTab === 'konten' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-ink">🇮🇩 Konten Lengkap (ID) — HTML</label>
                  <button
                    onClick={() => translateField('content')}
                    disabled={translating === 'content_translate'}
                    className="text-xs text-blue-500 hover:text-blue-700 disabled:opacity-50"
                  >
                    {translating === 'content_translate' ? <Loader2 className="w-3 h-3 animate-spin inline" /> : <Languages className="w-3 h-3 inline mr-0.5" />}
                    Auto Translate
                  </button>
                </div>
                <textarea
                  value={form.content_id}
                  onChange={(e) => setForm({ ...form, content_id: e.target.value })}
                  rows={10}
                  placeholder='<h3>Judul</h3><p>Isi materi lengkap dalam HTML...</p>'
                  className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
                />
                <p className="text-xs text-muted mt-1">
                  Gunakan HTML: &lt;h3&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;table&gt;
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

          {/* Tab: Media */}
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
                folder="materi-biologi"
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
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
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
        title="Hapus Materi Biologi"
        message={`Yakin ingin menghapus "${deleting?.title_id || deleting?.sub_bab_key}"? Data dari sub-bab dan materi akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
