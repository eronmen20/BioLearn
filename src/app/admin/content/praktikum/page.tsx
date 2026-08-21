'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { Modal, ConfirmDialog } from '@/components/admin/modal';
import { showToast } from '@/components/ui/toaster';
import { TranslateButton } from '@/components/admin/translate-button';
import { MediaUpload } from '@/components/admin/image-upload';
import {
  Plus, Trash2, Save, Edit, Eye, Loader2, FlaskConical,
  Image as ImageIcon, X, Move,
} from 'lucide-react';
import { BAB } from '@/lib/bab-data';
import { adminFetch } from "@/lib/admin-fetch";

interface PraktikumCard {
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  x: number;
  y: number;
}

interface PraktikumStep {
  step: number;
  instruction: string;
  instruction_en: string;
}

interface PraktikumItem {
  id: number;
  bab_id: string;
  sub_bab_key: string | null;
  title_id: string;
  title_en: string | null;
  description_id: string | null;
  description_en: string | null;
  image_url: string | null;
  image_alt: string | null;
  steps: PraktikumStep[];
  flashcards: PraktikumCard[];
  difficulty: string;
  status: 'draft' | 'published';
  sort_order: number;
}

interface SubBabOption {
  key: string;
  title_id: string | null;
  title_en: string | null;
}

const DEFAULT_FORM = {
  bab_id: 'bakteri',
  sub_bab_key: '',
  title_id: '',
  title_en: '',
  description_id: '',
  description_en: '',
  image_url: '',
  image_alt: '',
  steps: [{ step: 1, instruction: '', instruction_en: '' }] as PraktikumStep[],
  flashcards: [] as PraktikumCard[],
  difficulty: 'sedang',
  status: 'draft' as PraktikumItem['status'],
  sort_order: '1',
};

const EMPTY_CARD: PraktikumCard = {
  name: '', name_en: '', description: '', description_en: '', x: 50, y: 50,
};

export default function PraktikumPage() {
  const [items, setItems] = useState<PraktikumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBab, setFilterBab] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<PraktikumItem | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState<PraktikumItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [subBabOptions, setSubBabOptions] = useState<SubBabOption[]>([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const formRef = useRef<HTMLDivElement>(null);

  const loadSubBabs = useCallback(async (babId: string) => {
    if (!babId) { setSubBabOptions([]); return; }
    try {
      const res = await adminFetch(`/api/sub-bab?bab_id=${encodeURIComponent(babId)}&_t=${Date.now()}`, { cache: 'no-store' });
      const json = await res.json();
      setSubBabOptions((json.subBab || []).map((s: any) => ({
        key: s.key,
        title_id: s.title_id || null,
        title_en: s.title_en || null,
      })));
    } catch {
      setSubBabOptions([]);
    }
  }, []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterBab ? `/api/admin/praktikum?bab_id=${filterBab}` : '/api/admin/praktikum';
      const res = await adminFetch(url, { cache: 'no-store' });
      const data = await res.json();
      setItems((data.praktikum || []) as PraktikumItem[]);
    } catch {
      showToast('Gagal memuat data praktikum');
    } finally {
      setLoading(false);
    }
  }, [filterBab]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const handleAdd = () => {
    setEditing(null);
    const initialBab = filterBab || BAB[0]?.id || 'bakteri';
    setForm({ ...DEFAULT_FORM, bab_id: initialBab, sub_bab_key: '', status: 'draft' });
    setActiveCardIdx(0);
    loadSubBabs(initialBab);
    setShowEditor(true);
  };

  const handleEdit = (item: PraktikumItem) => {
    setEditing(item);
    setForm({
      bab_id: item.bab_id,
      sub_bab_key: item.sub_bab_key || '',
      title_id: item.title_id || '',
      title_en: item.title_en || '',
      description_id: item.description_id || '',
      description_en: item.description_en || '',
      image_url: item.image_url || '',
      image_alt: item.image_alt || '',
      steps: Array.isArray(item.steps) && item.steps.length > 0
        ? item.steps.map((s, i) => ({ step: s.step || i + 1, instruction: s.instruction || '', instruction_en: s.instruction_en || '' }))
        : [{ step: 1, instruction: '', instruction_en: '' }],
      flashcards: Array.isArray(item.flashcards) && item.flashcards.length > 0
        ? item.flashcards.map((c) => ({
            name: c.name || '', name_en: c.name_en || '',
            description: c.description || '', description_en: c.description_en || '',
            x: typeof c.x === 'number' ? c.x : 50,
            y: typeof c.y === 'number' ? c.y : 50,
          }))
        : [],
      difficulty: item.difficulty || 'sedang',
      status: item.status || 'draft',
      sort_order: String(item.sort_order || 1),
    });
    setActiveCardIdx(0);
    loadSubBabs(item.bab_id);
    setShowEditor(true);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const res = await adminFetch(`/api/admin/praktikum?id=${deleting.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed');
      }
      showToast('Praktikum berhasil dihapus!');
      setShowDelete(false);
      setDeleting(null);
      loadItems();
    } catch (e) {
      showToast(`Gagal menghapus praktikum: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  };

  const handleTogglePublish = async (item: PraktikumItem) => {
    try {
      const newStatus = item.status === 'published' ? 'draft' : 'published';
      const res = await adminFetch('/api/admin/praktikum', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      showToast(
        newStatus === 'published'
          ? `🟢 "${item.title_id}" dipublikasikan. User dapat melihat di sub-bab terkait.`
          : `📦 "${item.title_id}" kembali ke draft. User tidak melihat sampai dipublikasi lagi.`
      );
      loadItems();
    } catch (e) {
      showToast(`Gagal: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
  };

  const handleSave = async () => {
    if (!form.title_id.trim()) {
      showToast('Judul (ID) wajib diisi');
      return;
    }
    setSaving(true);
    try {
      // Bunny steps: trim, drop empty rows
      const cleanedSteps = form.steps
        .filter((s) => s.instruction.trim() || s.instruction_en.trim())
        .map((s, i) => ({ step: i + 1, instruction: s.instruction.trim(), instruction_en: s.instruction_en.trim() }));

      const cleanedCards = form.flashcards
        .filter((c) => c.name.trim() || c.description.trim() || c.name_en.trim() || c.description_en.trim())
        .map((c) => ({
          name: c.name.trim(),
          name_en: c.name_en.trim(),
          description: c.description.trim(),
          description_en: c.description_en.trim(),
          x: c.x, y: c.y,
        }));

      const payload: Record<string, unknown> = {
        bab_id: form.bab_id,
        sub_bab_key: form.sub_bab_key || null,
        title_id: form.title_id.trim(),
        title_en: form.title_en.trim() || null,
        description_id: form.description_id.trim() || null,
        description_en: form.description_en.trim() || null,
        image_url: form.image_url.trim() || null,
        image_alt: form.image_alt.trim() || null,
        steps: cleanedSteps,
        flashcards: cleanedCards,
        difficulty: form.difficulty,
        status: form.status,
        sort_order: parseInt(form.sort_order, 10) || 1,
      };
      if (editing) payload.id = editing.id;

      const res = await adminFetch('/api/admin/praktikum', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed');
      }

      const target = form.sub_bab_key
        ? `sub-bab "${form.sub_bab_key}"`
        : `BAB "${form.bab_id}" (semua sub-bab)`;
      showToast(
        editing
          ? `✅ Praktikum "${form.title_id}" diupdate untuk ${target}.`
          : `🧪 Praktikum baru "${form.title_id}" ditambahkan ke ${target}.`
      );
      setShowEditor(false);
      loadItems();
    } catch (e) {
      showToast(`Gagal menyimpan praktikum: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // ─── Step operations ───
  const addStep = () => {
    setForm({
      ...form,
      steps: [...form.steps, { step: form.steps.length + 1, instruction: '', instruction_en: '' }],
    });
  };
  const removeStep = (idx: number) => {
    setForm({ ...form, steps: form.steps.filter((_, i) => i !== idx) });
  };
  const updateStep = (idx: number, field: keyof PraktikumStep, value: string) => {
    const newSteps = [...form.steps];
    newSteps[idx] = { ...newSteps[idx], [field]: value };
    setForm({ ...form, steps: newSteps });
  };

  // ─── Card operations ───
  const addCard = () => {
    setForm({ ...form, flashcards: [...form.flashcards, { ...EMPTY_CARD }] });
    setActiveCardIdx(form.flashcards.length);
  };
  const removeCard = (idx: number) => {
    const newCards = form.flashcards.filter((_, i) => i !== idx);
    setForm({ ...form, flashcards: newCards });
    if (activeCardIdx >= newCards.length) setActiveCardIdx(Math.max(0, newCards.length - 1));
  };
  const updateCard = (idx: number, field: keyof PraktikumCard, value: string | number) => {
    const newCards = [...form.flashcards];
    newCards[idx] = { ...newCards[idx], [field]: value };
    setForm({ ...form, flashcards: newCards });
  };

  const currentCard = form.flashcards[activeCardIdx];

  const columns: Column<PraktikumItem>[] = [
    {
      key: 'bab_id',
      label: 'BAB → Sub-BAB',
      sortable: true,
      render: (row) => {
        const bab = BAB.find((b) => b.id === row.bab_id);
        return (
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              {bab?.icon || '📚'} <span className="font-medium text-ink">{row.bab_id}</span>
            </div>
            <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
              row.sub_bab_key
                ? 'bg-accent/15 text-accent'
                : 'bg-bg-alt text-muted'
            }`}>
              {row.sub_bab_key ? `→ ${row.sub_bab_key}` : 'Semua sub-bab'}
            </span>
          </div>
        );
      },
    },
    { key: 'title_id', label: 'Judul', sortable: true, render: (row) => (
      <div>
        <p className="font-medium text-ink">{row.title_id}</p>
        {row.title_en && <p className="text-xs text-muted italic">🌐 {row.title_en}</p>}
      </div>
    ) },
    {
      key: 'image_url',
      label: 'Media',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          {row.image_url && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-green-500/15 text-green-700 flex items-center gap-0.5">
              <ImageIcon className="w-2.5 h-2.5" /> Gambar
            </span>
          )}
          {row.flashcards.length > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-accent/15 text-accent">
              {row.flashcards.length} card
            </span>
          )}
          {row.steps.length > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-700">
              {row.steps.length} step
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'difficulty',
      label: 'Tingkat',
      sortable: true,
      render: (row) => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${
          row.difficulty === 'mudah' ? 'bg-green-500/15 text-green-700'
          : row.difficulty === 'sulit' ? 'bg-red-500/15 text-red-700'
          : 'bg-yellow-500/15 text-yellow-700'
        }`}>
          {row.difficulty === 'mudah' ? '🟢 Mudah' : row.difficulty === 'sulit' ? '🔴 Sulit' : '🟡 Sedang'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <button
          onClick={() => handleTogglePublish(row)}
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full transition-colors ${
            row.status === 'published'
              ? 'bg-green-500/20 text-green-700 hover:bg-green-500/30'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
          title={row.status === 'published' ? 'Klik untuk kembalikan ke draft' : 'Klik untuk publikasikan'}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'published' ? 'bg-green-500' : 'bg-gray-400'}`} />
          {row.status === 'published' ? 'Published' : 'Draft'}
        </button>
      ),
    },
    {
      key: 'sort_order',
      label: '#',
      className: 'w-12',
      render: (row) => <span className="text-xs text-muted">#{row.sort_order}</span>,
    },
  ];

  return (
    <div className="space-y-6" ref={formRef}>
      <AdminPageHeader
        title="Praktikum"
        description="Kelola praktikum interaktif dengan langkah, gambar, hotspot flashcard, dan bilingual"
        action={{ label: 'Tambah Praktikum', onClick: handleAdd }}
      />

      {/* Filter BAB */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterBab('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            !filterBab ? 'bg-accent text-white' : 'bg-surface border border-border text-muted hover:text-ink'
          }`}
        >
          Semua ({items.length})
        </button>
        {BAB.map((bab) => (
          <button
            key={bab.id}
            onClick={() => setFilterBab(bab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterBab === bab.id ? 'bg-accent text-white' : 'bg-surface border border-border text-muted hover:text-ink'
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
        searchPlaceholder="Cari praktikum..."
        searchKeys={['title_id', 'title_en', 'bab_id', 'sub_bab_key']}
        emptyMessage="Belum ada praktikum. Klik 'Tambah Praktikum' untuk menambahkan."
        actions={(row) => (
          <div className="flex items-center gap-1">
            <button onClick={() => handleEdit(row)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-muted hover:text-blue-500 transition-colors" title="Edit">
              <Edit className="w-4 h-4" />
            </button>
            <button onClick={() => { setDeleting(row); setShowDelete(true); }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors" title="Hapus">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* ── Editor Modal ───────────────────────────────── */}
      <Modal open={showEditor} onClose={() => setShowEditor(false)} title={editing ? `Edit: ${editing.title_id}` : 'Tambah Praktikum'} size="xl">
        <div className="space-y-4">
          {/* BAB + Sub-BAB + status row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Bab</label>
              <select
                value={form.bab_id}
                onChange={(e) => {
                  const newBab = e.target.value;
                  setForm({ ...form, bab_id: newBab, sub_bab_key: '' });
                  loadSubBabs(newBab);
                }}
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                {BAB.map((bab) => <option key={bab.id} value={bab.id}>{bab.icon} {bab.id}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Sub-BAB target</label>
              <select
                value={form.sub_bab_key}
                onChange={(e) => setForm({ ...form, sub_bab_key: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="">📚 Berlaku untuk semua sub-bab</option>
                {subBabOptions.map((s) => (
                  <option key={s.key} value={s.key}>
                    📍 {s.key} {s.title_id ? ` — ${s.title_id}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Tingkat Kesulitan</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="mudah">🟢 Mudah</option>
                <option value="sedang">🟡 Sedang</option>
                <option value="sulit">🔴 Sulit</option>
              </select>
            </div>
          </div>

          <p className="text-xs text-muted -mt-2">
            Pilih sub-bab spesifik atau kosongkan untuk tampilkan di semua sub-bab BAB.
          </p>

          {/* Title bilingual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">🇮🇩 Judul Praktikum (ID)</label>
              <input
                type="text"
                value={form.title_id}
                onChange={(e) => setForm({ ...form, title_id: e.target.value })}
                placeholder="Praktikum Pengamatan Bakteri"
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-ink">🇬🇧 Judul (EN)</label>
                <TranslateButton
                  source="id"
                  target="en"
                  text={form.title_id}
                  onTranslated={(t) => setForm({ ...form, title_en: t })}
                />
              </div>
              <input
                type="text"
                value={form.title_en}
                onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                placeholder="Bacteria Observation Lab"
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          {/* Description bilingual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">🇮🇩 Deskripsi (ID)</label>
              <textarea
                value={form.description_id}
                onChange={(e) => setForm({ ...form, description_id: e.target.value })}
                rows={3}
                placeholder="Deskripsi singkat praktikum ini..."
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-ink">🇬🇧 Deskripsi (EN)</label>
                <TranslateButton
                  source="id"
                  target="en"
                  text={form.description_id}
                  onTranslated={(t) => setForm({ ...form, description_en: t })}
                />
              </div>
              <textarea
                value={form.description_en}
                onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                rows={3}
                placeholder="Short description of this lab..."
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
              />
            </div>
          </div>

          {/* Image upload */}
          <div className="border-t border-border pt-4">
            <MediaUpload
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              folder="praktikum"
              label="🖼️ Gambar Praktikum (opsional)"
              kind="image"
              placeholder="https://... atau upload"
            />
            {form.image_url && (
              <div className="mt-2 flex items-start gap-2">
                <label className="text-xs text-muted pt-2">Alt text:</label>
                <input
                  type="text"
                  value={form.image_alt}
                  onChange={(e) => setForm({ ...form, image_alt: e.target.value })}
                  placeholder="Deskripsi gambar untuk aksesibilitas"
                  className="flex-1 px-2 py-1 border border-border rounded-lg bg-bg-alt text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
            )}
          </div>

          {/* Image preview with hotspot dots */}
          {form.image_url && (
            <div className="bg-bg-alt rounded-xl border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted">Preview Gambar + Titik Hotspot</label>
                {form.flashcards.length > 0 && (
                  <span className="text-[10px] text-muted">{form.flashcards.length} hotspot</span>
                )}
              </div>
              <div className="relative inline-block w-full max-w-md">
                <img
                  src={form.image_url}
                  alt={form.image_alt || "Preview"}
                  className="w-full rounded-lg border border-border"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                {form.flashcards.map((card, i) => (
                  <div
                    key={i}
                    className={`absolute w-5 h-5 rounded-full border-2 cursor-pointer transition-all ${
                      i === activeCardIdx ? "bg-accent border-white scale-125 shadow-lg" : "bg-red border-white/80"
                    }`}
                    style={{ left: `${card.x}%`, top: `${card.y}%`, transform: "translate(-50%, -50%)" }}
                    onClick={() => setActiveCardIdx(i)}
                    title={card.name || `Bagian ${i + 1}`}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps editor */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-ink">📋 Langkah Praktikum ({form.steps.length})</h3>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Step
              </button>
            </div>
            <div className="space-y-2.5">
              {form.steps.map((s, i) => (
                <div key={i} className="border border-border rounded-xl bg-bg-alt/40 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-purple-500 text-white text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="text-xs font-semibold text-ink">Step {i + 1}</span>
                    </div>
                    {form.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(i)}
                        className="p-1 rounded hover:bg-red-500/10 text-red transition-colors"
                        title="Hapus step"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-muted font-semibold">🇮🇩 Instruksi (ID)</label>
                        <TranslateButton
                          source="id"
                          target="en"
                          text={s.instruction}
                          onTranslated={(t) => updateStep(i, 'instruction_en', t)}
                        />
                      </div>
                      <textarea
                        value={s.instruction}
                        onChange={(e) => updateStep(i, 'instruction', e.target.value)}
                        rows={2}
                        placeholder={`Langkah ${i + 1}: Siapkan alat dan bahan...`}
                        className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-surface text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-muted font-semibold mb-1">🇬🇧 Instruction (EN)</label>
                      <textarea
                        value={s.instruction_en}
                        onChange={(e) => updateStep(i, 'instruction_en', e.target.value)}
                        rows={2}
                        placeholder={`Step ${i + 1}: Prepare tools and materials...`}
                        className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-surface text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flashcards editor */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-ink">
                🔬 Flashcard Hotspot ({form.flashcards.length})
                <span className="text-[10px] text-muted ml-2 font-normal">— titik di gambar dengan flip card</span>
              </h3>
              <button
                type="button"
                onClick={addCard}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Card
              </button>
            </div>

            {form.flashcards.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {form.flashcards.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveCardIdx(i)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      activeCardIdx === i ? "bg-accent text-white" : "bg-surface border border-border text-muted hover:text-ink"
                    }`}
                  >
                    {c.name || `Bagian ${i + 1}`}
                  </button>
                ))}
              </div>
            )}

            {currentCard && (
              <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-ink">Card: {currentCard.name || `Bagian ${activeCardIdx + 1}`}</h4>
                  {form.flashcards.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCard(activeCardIdx)}
                      className="p-1 rounded hover:bg-red-500/10 text-red transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-muted font-semibold">🇮🇩 Nama Struktur</label>
                      <TranslateButton
                        source="id"
                        target="en"
                        text={currentCard.name}
                        onTranslated={(t) => updateCard(activeCardIdx, 'name_en', t)}
                      />
                    </div>
                    <input
                      type="text"
                      value={currentCard.name}
                      onChange={(e) => updateCard(activeCardIdx, 'name', e.target.value)}
                      placeholder="Dinding Sel"
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-bg-alt text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted font-semibold mb-1">🇬🇧 Structure (EN)</label>
                    <input
                      type="text"
                      value={currentCard.name_en}
                      onChange={(e) => updateCard(activeCardIdx, 'name_en', e.target.value)}
                      placeholder="Cell Wall"
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-bg-alt text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs text-muted font-semibold">🇮🇩 Fungsi / Deskripsi</label>
                      <TranslateButton
                        source="id"
                        target="en"
                        text={currentCard.description}
                        onTranslated={(t) => updateCard(activeCardIdx, 'description_en', t)}
                      />
                    </div>
                    <textarea
                      value={currentCard.description}
                      onChange={(e) => updateCard(activeCardIdx, 'description', e.target.value)}
                      rows={2}
                      placeholder="Melindungi sel dari lingkungan luar..."
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-bg-alt text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted font-semibold mb-1">🇬🇧 Function (EN)</label>
                    <textarea
                      value={currentCard.description_en}
                      onChange={(e) => updateCard(activeCardIdx, 'description_en', e.target.value)}
                      rows={2}
                      placeholder="Protects cell from external environment..."
                      className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-bg-alt text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                  <div>
                    <label className="block text-xs text-muted mb-1">📍 Posisi X: {currentCard.x}%</label>
                    <input
                      type="range"
                      min={0} max={100}
                      value={currentCard.x}
                      onChange={(e) => updateCard(activeCardIdx, 'x', Number(e.target.value))}
                      className="w-full accent-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">📍 Posisi Y: {currentCard.y}%</label>
                    <input
                      type="range"
                      min={0} max={100}
                      value={currentCard.y}
                      onChange={(e) => updateCard(activeCardIdx, 'y', Number(e.target.value))}
                      className="w-full accent-accent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status + sort_order */}
          <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as PraktikumItem['status'] })}
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="draft">📝 Draft — belum tampil ke user</option>
                <option value="published">🟢 Published — tampil ke user</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Urutan</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          {/* Save */}
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

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Praktikum"
        message={`Yakin ingin menghapus praktikum "${deleting?.title_id}"? Tindakan ini tidak dapat dibatalkan.`}
        variant="danger"
      />
    </div>
  );
}
