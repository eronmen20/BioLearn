"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DataTable, Column } from "@/components/admin/data-table";
import { Modal, ConfirmDialog } from "@/components/admin/modal";
import { showToast } from "@/components/ui/toaster";
import { MediaUpload } from "@/components/admin/image-upload";
import { TranslateButton } from "@/components/admin/translate-button";
import { adminFetch } from "@/lib/admin-fetch";
import {
  Plus,
  Trash2,
  Save,
  Edit,
  Eye,
  Loader2,
  ImageIcon,
  X,
  ExternalLink,
  Layers,
  Sparkles,
  Crosshair,
  MapPin,
} from "lucide-react";

export interface SpecimenHotspot {
  id: string;
  name_id: string;
  name_en: string;
  desc_id: string;
  desc_en: string;
  x: number;
  y: number;
}

export interface SpecimenItem {
  id: string;
  name_id: string;
  name_en: string;
  latin_name?: string;
  category: "tumbuhan" | "hewan" | "mikroba" | "lainnya";
  description_id: string;
  description_en: string;
  image_url: string;
  recommended_mag: number;
  target_focus: number;
  is_published: boolean;
  sort_order: number;
  hotspots?: SpecimenHotspot[];
}

const DEFAULT_FORM: SpecimenItem = {
  id: "",
  name_id: "",
  name_en: "",
  latin_name: "",
  category: "tumbuhan",
  description_id: "",
  description_en: "",
  image_url: "",
  recommended_mag: 10,
  target_focus: 0,
  is_published: true,
  sort_order: 1,
  hotspots: [],
};

const CATEGORY_BADGES: Record<string, { label: string; cls: string }> = {
  tumbuhan: { label: "🌿 Tumbuhan", cls: "bg-emerald-500/15 text-emerald-700" },
  hewan: { label: "🐾 Hewan / Jaringan", cls: "bg-amber-500/15 text-amber-700" },
  mikroba: { label: "🦠 Mikroorganisme", cls: "bg-purple-500/15 text-purple-700" },
  lainnya: { label: "🔬 Lainnya", cls: "bg-blue-500/15 text-blue-700" },
};

export default function AdminMikroskopPage() {
  const [items, setItems] = useState<SpecimenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editItem, setEditItem] = useState<SpecimenItem | null>(null);
  const [formData, setFormData] = useState<SpecimenItem>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteItem, setDeleteItem] = useState<SpecimenItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Hotspot Form state
  const [newHotspotName, setNewHotspotName] = useState("");
  const [newHotspotDesc, setNewHotspotDesc] = useState("");
  const [newHotspotX, setNewHotspotX] = useState<number>(50);
  const [newHotspotY, setNewHotspotY] = useState<number>(50);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/api/admin/mikroskop");
      const data = await res.json();
      if (res.ok) {
        setItems(data.specimens || []);
      } else {
        showToast(data.error || "Gagal memuat preparat mikroskop");
      }
    } catch {
      showToast("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleOpenAdd = () => {
    setEditItem(null);
    setFormData({
      ...DEFAULT_FORM,
      id: `specimen-${Date.now()}`,
      sort_order: items.length + 1,
    });
    setShowEditor(true);
  };

  const handleOpenEdit = (item: SpecimenItem) => {
    setEditItem(item);
    setFormData({
      ...item,
      hotspots: Array.isArray(item.hotspots) ? item.hotspots : [],
    });
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!formData.name_id.trim()) {
      showToast("Nama preparat wajib diisi");
      return;
    }
    if (!formData.image_url.trim()) {
      showToast("Foto preparat mikroskop wajib diunggah atau diisi URL-nya");
      return;
    }

    try {
      setSaving(true);
      const isEdit = !!editItem;
      const res = await adminFetch("/api/admin/mikroskop", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(isEdit ? "Preparat berhasil diperbarui" : "Preparat baru berhasil ditambahkan");
        setShowEditor(false);
        fetchItems();
      } else {
        showToast(data.error || "Gagal menyimpan");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      setDeleting(true);
      const res = await adminFetch(`/api/admin/mikroskop?id=${encodeURIComponent(deleteItem.id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Preparat berhasil dihapus");
        setDeleteItem(null);
        fetchItems();
      } else {
        const data = await res.json();
        showToast(data.error || "Gagal menghapus");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan");
    } finally {
      setDeleting(false);
    }
  };

  // Handle klik langsung pada foto untuk menentukan posisi pin X, Y
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    const clampedX = Math.max(2, Math.min(98, x));
    const clampedY = Math.max(2, Math.min(98, y));
    setNewHotspotX(clampedX);
    setNewHotspotY(clampedY);
    showToast(`Posisi pin diatur ke X: ${clampedX}%, Y: ${clampedY}%`);
  };

  // Tambah hotspot
  const handleAddHotspot = () => {
    if (!newHotspotName.trim()) {
      showToast("Nama bagian/organel wajib diisi");
      return;
    }
    const newSpot: SpecimenHotspot = {
      id: `spot-${Date.now()}`,
      name_id: newHotspotName.trim(),
      name_en: newHotspotName.trim(),
      desc_id: newHotspotDesc.trim(),
      desc_en: newHotspotDesc.trim(),
      x: Math.round(newHotspotX),
      y: Math.round(newHotspotY),
    };
    setFormData((prev) => ({
      ...prev,
      hotspots: [...(prev.hotspots || []), newSpot],
    }));
    setNewHotspotName("");
    setNewHotspotDesc("");
    showToast(`Pin "${newSpot.name_id}" berhasil ditambahkan`);
  };

  const handleRemoveHotspot = (spotId: string) => {
    setFormData((prev) => ({
      ...prev,
      hotspots: (prev.hotspots || []).filter((h) => h.id !== spotId),
    }));
  };

  const filteredItems = items.filter((it) => {
    const q = search.toLowerCase();
    return (
      it.name_id.toLowerCase().includes(q) ||
      it.name_en.toLowerCase().includes(q) ||
      (it.latin_name && it.latin_name.toLowerCase().includes(q))
    );
  });

  const columns: Column<SpecimenItem>[] = [
    {
      key: "image_url",
      label: "Foto",
      render: (item) => (
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-border-light overflow-hidden flex items-center justify-center relative">
          {item.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image_url} alt={item.name_id} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-5 h-5 text-muted" />
          )}
        </div>
      ),
    },
    {
      key: "name_id",
      label: "Nama Preparat",
      sortable: true,
      render: (item) => (
        <div>
          <p className="font-bold text-ink leading-snug">{item.name_id}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {item.latin_name && (
              <span className="text-xs text-muted italic">{item.latin_name}</span>
            )}
            <span className="text-xs text-muted/60">•</span>
            <span className="text-xs text-muted">{item.name_en}</span>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Kategori",
      sortable: true,
      render: (item) => {
        const badge = CATEGORY_BADGES[item.category] || CATEGORY_BADGES.lainnya;
        return (
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badge.cls}`}>
            {badge.label}
          </span>
        );
      },
    },
    {
      key: "recommended_mag",
      label: "Perbesaran",
      render: (item) => (
        <span className="text-xs font-mono font-bold text-accent px-2 py-0.5 rounded-md bg-accent/10">
          {item.recommended_mag}x ({item.recommended_mag * 10}x total)
        </span>
      ),
    },
    {
      key: "is_published",
      label: "Status",
      render: (item) => (
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
            item.is_published
              ? "bg-emerald-500/15 text-emerald-700"
              : "bg-zinc-500/15 text-zinc-600"
          }`}
        >
          {item.is_published ? "Published" : "Draft"}
        </span>
      ),
    },
    {
      key: "id",
      label: "Aksi",
      className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(item)}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-bg-alt transition-colors"
            title="Edit preparat"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteItem(item)}
            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
            title="Hapus preparat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink">Preparat Mikroskop Virtual</h1>
          <p className="text-sm text-muted mt-1">
            Kelola katalog foto preparat mikroskop yang dapat diamati siswa di BioLab
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/biolab/mikroskop"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border-light text-xs font-semibold text-muted hover:text-ink hover:bg-bg-alt transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Preview Lab
          </Link>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent-dark text-white text-xs font-bold shadow-sm transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Tambah Preparat
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama preparat atau nama ilmiah..."
          className="w-full sm:w-80 px-3.5 py-2 text-xs rounded-xl border border-border-light bg-card focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <div className="text-xs text-muted">
          Total: <span className="font-bold text-ink">{filteredItems.length}</span> preparat
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card border border-border-light rounded-3xl overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          data={filteredItems}
          loading={loading}
          emptyMessage="Belum ada preparat mikroskop. Klik 'Tambah Preparat' untuk mengunggah foto baru."
        />
      </div>

      {/* Modal Editor (Tambah / Edit Preparat) */}
      <Modal
        open={showEditor}
        onClose={() => setShowEditor(false)}
        title={editItem ? "Edit Preparat Mikroskop" : "Tambah Preparat Mikroskop Baru"}
        size="lg"
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
          {/* 1. Nama Preparat (Bilingual) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink block mb-1">
                Nama Preparat (Indonesia) *
              </label>
              <input
                type="text"
                value={formData.name_id}
                onChange={(e) => setFormData({ ...formData, name_id: e.target.value })}
                placeholder="Contoh: Sel Epidermis Bawang Merah"
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-light bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-ink">
                  Nama Preparat (English)
                </label>
                <TranslateButton
                  source="id"
                  target="en"
                  text={formData.name_id}
                  onTranslated={(t) => setFormData((prev) => ({ ...prev, name_en: t }))}
                />
              </div>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                placeholder="e.g. Onion Epidermal Cells"
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-light bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* 2. Nama Ilmiah & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink block mb-1">
                Nama Ilmiah / Latin (Opsional)
              </label>
              <input
                type="text"
                value={formData.latin_name || ""}
                onChange={(e) => setFormData({ ...formData, latin_name: e.target.value })}
                placeholder="Contoh: Allium cepa"
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-light bg-surface text-ink italic focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink block mb-1">
                Kategori
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as SpecimenItem["category"],
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-light bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="tumbuhan">🌿 Tumbuhan</option>
                <option value="hewan">🐾 Hewan / Jaringan</option>
                <option value="mikroba">🦠 Mikroorganisme</option>
                <option value="lainnya">🔬 Lainnya</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink block mb-1">
                Perbesaran Optimal
              </label>
              <select
                value={formData.recommended_mag}
                onChange={(e) =>
                  setFormData({ ...formData, recommended_mag: Number(e.target.value) })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-light bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value={4}>4x (Total 40x - Scanning)</option>
                <option value={10}>10x (Total 100x - Low Power)</option>
                <option value={40}>40x (Total 400x - High Power)</option>
                <option value={100}>100x (Total 1000x - Oil Immersion)</option>
              </select>
            </div>
          </div>

          {/* 3. Unggah Foto Preparat (MediaUpload ke Storage / URL) */}
          <div>
            <MediaUpload
              value={formData.image_url}
              onChange={(url) => setFormData({ ...formData, image_url: url })}
              label="Foto Preparat Mikroskop *"
              folder="preparat"
              placeholder="/images/preparat/... atau unggah foto JPG/PNG"
              hint="Unggah foto mikroskopis beresolusi tinggi (JPG, PNG, WebP, atau SVG)"
            />
          </div>

          {/* 4. Deskripsi Preparat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink block mb-1">
                Deskripsi & Ciri Preparat (ID)
              </label>
              <textarea
                rows={3}
                value={formData.description_id}
                onChange={(e) => setFormData({ ...formData, description_id: e.target.value })}
                placeholder="Penjelasan struktur jaringan, pewarnaan, dan bagian penting..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-light bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-ink">
                  Deskripsi & Ciri Preparat (EN)
                </label>
                <TranslateButton
                  source="id"
                  target="en"
                  text={formData.description_id}
                  onTranslated={(t) => setFormData((prev) => ({ ...prev, description_en: t }))}
                />
              </div>
              <textarea
                rows={3}
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                placeholder="Description of specimen tissue and features..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-light bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              />
            </div>
          </div>

          {/* 5. Status & Urutan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink block mb-1">
                Status Publikasi
              </label>
              <select
                value={formData.is_published ? "true" : "false"}
                onChange={(e) =>
                  setFormData({ ...formData, is_published: e.target.value === "true" })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-light bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="true">Published (Tampil untuk siswa)</option>
                <option value="false">Draft (Hanya disimpan di admin)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink block mb-1">
                Urutan Tampil (Sort Order)
              </label>
              <input
                type="number"
                min="1"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-light bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* 6. Hotspot Organel Anotasi (Visual Pin Canvas & Click-to-Place) */}
          <div className="pt-2 border-t border-border-light space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  <span>Titik Anotasi Organel ({formData.hotspots?.length || 0})</span>
                </h4>
                <p className="text-[10px] text-muted mt-0.5">
                  Klik langsung pada gambar di bawah untuk menentukan posisi titik penunjuk organel
                </p>
              </div>
              <span className="text-[10px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                Interactive Pinning
              </span>
            </div>

            {/* Kanvas Interaktif Pratinjau Foto & Titik Pin */}
            {formData.image_url ? (
              <div className="rounded-2xl border border-border-light bg-slate-950 p-2 overflow-hidden shadow-inner">
                <div
                  onClick={handleImageClick}
                  className="relative w-full max-h-72 aspect-video mx-auto bg-black rounded-xl overflow-hidden cursor-crosshair select-none group flex items-center justify-center"
                  title="Klik di mana saja pada foto untuk menentukan koordinat X & Y"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.image_url}
                    alt={formData.name_id || "Preparat"}
                    className="w-full h-full object-contain pointer-events-none"
                  />

                  {/* Grid overlay halus */}
                  <div className="absolute inset-0 bg-[radial-gradient(#3b82f615_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                  {/* Pin-pin yang SUDAH TERSIMPAN */}
                  {formData.hotspots?.map((spot, idx) => (
                    <div
                      key={spot.id}
                      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto flex flex-col items-center group/pin"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewHotspotName(spot.name_id);
                        setNewHotspotDesc(spot.desc_id);
                        setNewHotspotX(spot.x);
                        setNewHotspotY(spot.y);
                        showToast(`Pin #${idx + 1} "${spot.name_id}" dimuat ke form`);
                      }}
                    >
                      <div className="w-5 h-5 rounded-full bg-accent border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-black cursor-pointer hover:scale-125 transition-transform">
                        {idx + 1}
                      </div>
                      <span className="mt-1 px-1.5 py-0.5 rounded bg-black/85 text-[9px] font-medium text-white whitespace-nowrap shadow opacity-80 group-hover/pin:opacity-100 transition-opacity">
                        {spot.name_id}
                      </span>
                    </div>
                  ))}

                  {/* Pin TARGET BARU (yang sedang disiapkan) */}
                  <div
                    style={{ left: `${newHotspotX}%`, top: `${newHotspotY}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex flex-col items-center animate-pulse"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-xl flex items-center justify-center text-white text-[11px] font-bold">
                      <Crosshair className="w-3.5 h-3.5" />
                    </div>
                    <span className="mt-1 px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-[9px] font-bold text-emerald-300 whitespace-nowrap">
                      X: {newHotspotX}%, Y: {newHotspotY}% (Target Baru)
                    </span>
                  </div>

                  {/* Petunjuk bantuan klik */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-[10px] text-white/80 pointer-events-none flex items-center gap-1.5">
                    <Crosshair className="w-3 h-3 text-accent" />
                    <span>Klik pada foto untuk set posisi pin</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-bg-alt border border-dashed border-border-light text-center text-xs text-muted">
                Unggah atau isi URL foto preparat terlebih dahulu untuk melihat pratinjau kanvas titik anotasi.
              </div>
            )}

            {/* List Hotspot yang sudah ada */}
            {formData.hotspots && formData.hotspots.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {formData.hotspots.map((spot, idx) => (
                  <div
                    key={spot.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-bg-alt text-xs border border-border-light/60 hover:border-accent/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-accent/15 text-accent font-extrabold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-ink">{spot.name_id}</span>
                        {spot.desc_id && (
                          <p className="text-[10px] text-muted line-clamp-1">{spot.desc_id}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted bg-surface px-1.5 py-0.5 rounded border border-border-light">
                        X:{spot.x}% Y:{spot.y}%
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveHotspot(spot.id)}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Hapus pin ini"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted italic">Belum ada titik anotasi yang disimpan.</p>
            )}

            {/* Form Tambah Hotspot Cepat */}
            <div className="p-3 rounded-2xl bg-surface border border-border-light space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-ink flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-accent" />
                  Tambah Titik Pin Baru:
                </span>
                <span className="text-[10px] font-mono text-accent">
                  Posisi: X={newHotspotX}%, Y={newHotspotY}%
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newHotspotName}
                  onChange={(e) => setNewHotspotName(e.target.value)}
                  placeholder="Nama bagian (contoh: Nukleus, Stomata, Vakuola)"
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-border-light bg-card text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <input
                  type="text"
                  value={newHotspotDesc}
                  onChange={(e) => setNewHotspotDesc(e.target.value)}
                  placeholder="Keterangan singkat fungsi bagian ini..."
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-border-light bg-card text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3 text-xs text-muted">
                  <div className="flex items-center gap-1">
                    <span>X:</span>
                    <input
                      type="number"
                      min="2"
                      max="98"
                      value={newHotspotX}
                      onChange={(e) => setNewHotspotX(Number(e.target.value))}
                      className="w-14 px-1.5 py-1 text-xs rounded-lg border border-border-light bg-card text-ink font-mono"
                    />
                    <span>%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>Y:</span>
                    <input
                      type="number"
                      min="2"
                      max="98"
                      value={newHotspotY}
                      onChange={(e) => setNewHotspotY(Number(e.target.value))}
                      className="w-14 px-1.5 py-1 text-xs rounded-lg border border-border-light bg-card text-ink font-mono"
                    />
                    <span>%</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddHotspot}
                  className="px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-dark text-white font-bold text-xs shadow-sm transition-all hover:scale-105"
                >
                  + Tambah Pin
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-border-light mt-4">
          <button
            onClick={() => setShowEditor(false)}
            disabled={saving}
            className="px-4 py-2 rounded-xl border border-border-light text-xs font-bold text-muted hover:text-ink hover:bg-bg-alt transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-accent hover:bg-accent-dark text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Simpan Preparat
              </>
            )}
          </button>
        </div>
      </Modal>

      {/* Dialog Konfirmasi Hapus */}
      <ConfirmDialog
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        title="Hapus Preparat Mikroskop"
        message={`Apakah Anda yakin ingin menghapus preparat "${deleteItem?.name_id}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
