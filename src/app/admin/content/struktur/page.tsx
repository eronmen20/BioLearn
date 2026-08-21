"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, Column } from "@/components/admin/data-table";
import { Modal, ConfirmDialog } from "@/components/admin/modal";
import { showToast } from "@/components/ui/toaster";
import { BAB } from "@/lib/bab-data";
import { TranslateButton } from "@/components/admin/translate-button";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  Plus, Trash2, Save, Edit, Eye, Loader2, FlaskConical, Image as ImageIcon,
  Move, GripVertical, X,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-fetch";

interface Flashcard {
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  x: number;
  y: number;
}

interface StrukturItem {
  id: number;
  bab_id: string;
  sub_bab_key: string | null;
  title: string;
  title_en: string | null;
  image_url: string | null;
  image_alt: string | null;
  flashcards: Flashcard[];
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const EMPTY_FLASHCARD: Flashcard = {
  name: "", name_en: "", description: "", description_en: "", x: 50, y: 50,
};

export default function StrukturPage() {
  const [items, setItems] = useState<StrukturItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBab, setFilterBab] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<StrukturItem | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState<StrukturItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeFlashcard, setActiveFlashcard] = useState(0);

  // Sub-bab data loaded dynamically when bab changes
  const [subBabList, setSubBabList] = useState<Array<{ key: string; title_id: string | null }>>([]);

  // Form state
  const [form, setForm] = useState({
    bab_id: "",
    sub_bab_key: "",
    title: "",
    title_en: "",
    image_url: "",
    image_alt: "",
    flashcards: [] as Flashcard[],
  });

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterBab ? `/api/admin/struktur?bab_id=${filterBab}` : "/api/admin/struktur";
      const res = await adminFetch(url);
      const data = await res.json();
      setItems(data.struktur || []);
    } catch {
      showToast("Gagal memuat data struktur");
    } finally {
      setLoading(false);
    }
  }, [filterBab]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const loadSubBabs = useCallback(async (babId: string) => {
    if (!babId) { setSubBabList([]); return; }
    try {
      const res = await fetch(`/api/sub-bab?bab_id=${encodeURIComponent(babId)}&_t=${Date.now()}`, { cache: "no-store" });
      const json = await res.json();
      setSubBabList(json.subBab || []);
    } catch {
      setSubBabList([]);
    }
  }, []);

  const handleAdd = () => {
    setEditing(null);
    const initialBab = filterBab || BAB[0]?.id || "";
    setForm({
      bab_id: initialBab,
      sub_bab_key: "",
      title: "", title_en: "", image_url: "", image_alt: "",
      flashcards: [{ ...EMPTY_FLASHCARD }],
    });
    setActiveFlashcard(0);
    loadSubBabs(initialBab);
    setShowEditor(true);
  };

  const handleEdit = (item: StrukturItem) => {
    setEditing(item);
    setForm({
      bab_id: item.bab_id,
      sub_bab_key: item.sub_bab_key || "",
      title: item.title,
      title_en: item.title_en || "",
      image_url: item.image_url || "",
      image_alt: item.image_alt || "",
      flashcards: (item.flashcards as Flashcard[])?.length > 0
        ? (item.flashcards as Flashcard[])
        : [{ ...EMPTY_FLASHCARD }],
    });
    setActiveFlashcard(0);
    loadSubBabs(item.bab_id);
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return showToast("Judul wajib diisi");
    setSaving(true);
    try {
      const payload = {
        ...(editing ? { id: editing.id } : {}),
        bab_id: form.bab_id,
        sub_bab_key: form.sub_bab_key || null,
        title: form.title,
        title_en: form.title_en,
        image_url: form.image_url,
        image_alt: form.image_alt,
        flashcards: form.flashcards,
      };

      const res = await adminFetch("/api/admin/struktur", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed");
      }
      const targetLabel = form.sub_bab_key
        ? `sub-bab "${form.sub_bab_key}"`
        : "BAB (semua sub-bab)";
      showToast(
        editing
          ? `Struktur berhasil diupdate untuk ${targetLabel}!`
          : `📇 Struktur "${form.title}" ditambahkan untuk ${targetLabel}.`
      );
      setShowEditor(false);
      loadItems();
    } catch (e) {
      showToast(`Gagal menyimpan struktur: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const res = await adminFetch(`/api/admin/struktur?id=${deleting.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      showToast("Struktur berhasil dihapus!");
      setShowDelete(false);
      setDeleting(null);
      loadItems();
    } catch {
      showToast("Gagal menghapus struktur");
    }
  };

  // Flashcard operations
  const addFlashcard = () => {
    setForm({ ...form, flashcards: [...form.flashcards, { ...EMPTY_FLASHCARD }] });
    setActiveFlashcard(form.flashcards.length);
  };

  const removeFlashcard = (idx: number) => {
    const newCards = form.flashcards.filter((_, i) => i !== idx);
    setForm({ ...form, flashcards: newCards.length > 0 ? newCards : [{ ...EMPTY_FLASHCARD }] });
    if (activeFlashcard >= newCards.length) setActiveFlashcard(Math.max(0, newCards.length - 1));
  };

  const updateFlashcard = (idx: number, field: keyof Flashcard, value: string | number) => {
    const newCards = [...form.flashcards];
    newCards[idx] = { ...newCards[idx], [field]: value };
    setForm({ ...form, flashcards: newCards });
  };

  const currentCard = form.flashcards[activeFlashcard];

  const columns: Column<StrukturItem>[] = [
    {
      key: "bab_id", label: "Bab", sortable: true,
      render: (row) => {
        const bab = BAB.find((b) => b.id === row.bab_id);
        return <span className="flex items-center gap-2"><span>{bab?.icon || "📚"}</span><span className="font-medium">{bab?.id || row.bab_id}</span></span>;
      },
    },
    { key: "title", label: "Judul", sortable: true },
    {
      key: "image_url", label: "Gambar",
      render: (row) => row.image_url
        ? <span className="text-xs text-green flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Ada</span>
        : <span className="text-xs text-muted italic">Belum ada</span>,
    },
    {
      key: "flashcards", label: "Flashcard",
      render: (row) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-semibold">
          <FlaskConical className="w-3 h-3" />
          {(row.flashcards as Flashcard[])?.length || 0} bagian
        </span>
      ),
    },
    {
      key: "updated_at", label: "Terakhir Diubah", sortable: true,
      render: (row) => <span className="text-xs text-muted">{row.updated_at ? new Date(row.updated_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Struktur & Fungsi"
        description="Kelola diagram struktur interaktif dengan flashcard untuk setiap bab"
        action={{ label: "Tambah Struktur", onClick: handleAdd }}
      />

      {/* Filter Bab */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterBab("")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!filterBab ? "bg-accent text-white" : "bg-surface border border-border text-muted hover:text-ink"}`}>Semua</button>
        {BAB.map((bab) => (
          <button key={bab.id} onClick={() => setFilterBab(bab.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterBab === bab.id ? "bg-accent text-white" : "bg-surface border border-border text-muted hover:text-ink"}`}>{bab.icon} {bab.id}</button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={items as any}
        loading={loading}
        searchPlaceholder="Cari struktur..."
        searchKeys={["title", "bab_id"]}
        emptyMessage="Belum ada struktur. Klik 'Tambah Struktur' untuk menambahkan."
        actions={(row) => (
          <div className="flex items-center gap-1">
            <button onClick={() => handleEdit(row)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-muted hover:text-blue-500 transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
            <button onClick={() => { setDeleting(row); setShowDelete(true); }} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
          </div>
        )}
      />

      {/* Editor Modal */}
      <Modal open={showEditor} onClose={() => setShowEditor(false)} title={editing ? `Edit: ${editing.title}` : "Tambah Struktur"} size="xl">
        <div className="space-y-4">
          {/* Bab + Title */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Bab</label>
              <select
                value={form.bab_id}
                onChange={(e) => {
                  const newBab = e.target.value;
                  setForm({ ...form, bab_id: newBab, sub_bab_key: "" });
                  loadSubBabs(newBab);
                }}
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                {BAB.map((bab) => <option key={bab.id} value={bab.id}>{bab.icon} {bab.id}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Sub-BAB (lokasi struktur)</label>
              <select
                value={form.sub_bab_key}
                onChange={(e) => setForm({ ...form, sub_bab_key: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="">— Berlaku untuk semua sub-bab BAB —</option>
                {subBabList.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.key} {s.title_id ? ` — ${s.title_id}` : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted mt-1">Pilih sub-bab spesifik atau kosongkan untuk tampilkan di semua sub-bab BAB.</p>
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-ink mb-1">Judul (ID)</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Struktur Sel Bakteri" className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-ink">Judul (EN)</label>
              <TranslateButton
                source="id"
                target="en"
                text={form.title}
                onTranslated={(t) => setForm({ ...form, title_en: t })}
              />
            </div>
            <input type="text" value={form.title_en} onChange={(e) => setForm({ ...form, title_en: e.target.value })} placeholder="Bacterial Cell Structure" className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>

          {/* Image Upload */}
          <ImageUpload
            value={form.image_url}
            onChange={(url) => setForm({ ...form, image_url: url })}
            folder="struktur"
            label="Gambar Struktur"
          />

          {/* Image Preview with dots */}
          {form.image_url && (
            <div className="bg-bg-alt rounded-xl border border-border p-4">
              <label className="block text-xs font-medium text-muted mb-2">Preview Gambar + Titik Flashcard</label>
              <div className="relative inline-block w-full max-w-md">
                <img src={form.image_url} alt={form.image_alt || "Preview"} className="w-full rounded-lg border border-border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                {form.flashcards.map((card, i) => (
                  <div
                    key={i}
                    className={`absolute w-4 h-4 rounded-full border-2 cursor-pointer transition-all ${i === activeFlashcard ? "bg-accent border-white scale-125 shadow-lg" : "bg-red border-white/80 opacity-80"}`}
                    style={{ left: `${card.x}%`, top: `${card.y}%`, transform: "translate(-50%, -50%)" }}
                    onClick={() => setActiveFlashcard(i)}
                    title={card.name || `Bagian ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Flashcards */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-ink">Flashcard Bagian ({form.flashcards.length})</h3>
              <button onClick={addFlashcard} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-light text-green hover:bg-green/20 transition-colors"><Plus className="w-3 h-3" /> Tambah Bagian</button>
            </div>

            {/* Flashcard tabs */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {form.flashcards.map((card, i) => (
                <button key={i} onClick={() => setActiveFlashcard(i)} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${activeFlashcard === i ? "bg-accent text-white" : "bg-surface border border-border text-muted hover:text-ink"}`}>
                  {card.name || `Bagian ${i + 1}`}
                </button>
              ))}
            </div>

            {/* Active flashcard editor */}
            {currentCard && (
              <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-ink">Flashcard: {currentCard.name || `Bagian ${activeFlashcard + 1}`}</h4>
                  {form.flashcards.length > 1 && (
                    <button onClick={() => removeFlashcard(activeFlashcard)} className="p-1 rounded hover:bg-red/5 text-red"><Trash2 className="w-3.5 h-3.5" /></button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">🇮🇩 Nama Bagian (Depan)</label>
                    <input type="text" value={currentCard.name} onChange={(e) => updateFlashcard(activeFlashcard, "name", e.target.value)} placeholder="Dinding Sel" className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-bg-alt text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent/30" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs text-muted">🇬🇧 Name (EN)</label>
                      <TranslateButton
                        source="id"
                        target="en"
                        text={currentCard.name}
                        onTranslated={(t) => updateFlashcard(activeFlashcard, "name_en", t)}
                      />
                    </div>
                    <input type="text" value={currentCard.name_en} onChange={(e) => updateFlashcard(activeFlashcard, "name_en", e.target.value)} placeholder="Cell Wall" className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-bg-alt text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent/30" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">🇮🇩 Fungsi (Belakang)</label>
                    <textarea value={currentCard.description} onChange={(e) => updateFlashcard(activeFlashcard, "description", e.target.value)} rows={2} placeholder="Melindungi sel dari lingkungan luar..." className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-bg-alt text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs text-muted">🇬🇧 Function (EN)</label>
                      <TranslateButton
                        source="id"
                        target="en"
                        text={currentCard.description}
                        onTranslated={(t) => updateFlashcard(activeFlashcard, "description_en", t)}
                      />
                    </div>
                    <textarea value={currentCard.description_en} onChange={(e) => updateFlashcard(activeFlashcard, "description_en", e.target.value)} rows={2} placeholder="Protects cell from external environment..." className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-bg-alt text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y" />
                  </div>
                </div>

                {/* Position sliders */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-muted mb-1">Posisi X: {currentCard.x}%</label>
                    <input type="range" min={0} max={100} value={currentCard.x} onChange={(e) => updateFlashcard(activeFlashcard, "x", Number(e.target.value))} className="w-full accent-accent" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted mb-1">Posisi Y: {currentCard.y}%</label>
                    <input type="range" min={0} max={100} value={currentCard.y} onChange={(e) => updateFlashcard(activeFlashcard, "y", Number(e.target.value))} className="w-full accent-accent" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button onClick={() => setShowEditor(false)} className="px-4 py-2.5 text-sm border border-border rounded-xl hover:bg-bg-alt transition-colors">Batal</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} title="Hapus Struktur" message={`Yakin ingin menghapus "${deleting?.title}"? Tindakan ini tidak dapat dibatalkan.`} />
    </div>
  );
}
