"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, Column } from "@/components/admin/data-table";
import { Modal, ConfirmDialog } from "@/components/admin/modal";
import { showToast } from "@/components/ui/toaster";
import { FileText, Eye, Edit, Trash2, Plus, Save, X } from "lucide-react";

interface BabItem { id: string; icon: string; color: string; kelas_id?: string; }

interface MateriItem {
  id: number;
  bab_id: string;
  sub_bab_key: string;
  type: string;
  content_id: string;
  content_en: string;
  summary_id: string;
  summary_en: string;
  sort_order: number;
  metadata: Record<string, unknown>;
}

export default function MateriPage() {
  const [materi, setMateri] = useState<MateriItem[]>([]);
  const [babList, setBabList] = useState<BabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBab, setFilterBab] = useState<string>("");
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<MateriItem | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState<MateriItem | null>(null);

  // Form state
  const [form, setForm] = useState({
    bab_id: "",
    sub_bab_key: "",
    type: "html",
    content_id: "",
    content_en: "",
    summary_id: "",
    summary_en: "",
    video_url: "",
    animation_type: "",
  });

  // Load materi from API
  const loadMateri = async () => {
    setLoading(true);
    try {
      // Fetch bab list from DB
      const resBab = await fetch('/api/admin/bab');
      const babData = await resBab.json();
      setBabList(babData.bab || []);

      const url = filterBab ? `/api/admin/materi?bab_id=${filterBab}` : "/api/admin/materi";
      const res = await fetch(url);
      const data = await res.json();
      setMateri(data.materi || []);
    } catch {
      showToast("Gagal memuat materi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMateri();
  }, [filterBab]);

  const handleAdd = () => {
    setEditing(null);
    setForm({
      bab_id: filterBab || babList[0]?.id || "",
      sub_bab_key: "",
      type: "html",
      content_id: "",
      content_en: "",
      summary_id: "",
      summary_en: "",
      video_url: "",
      animation_type: "",
    });
    setShowEditor(true);
  };

  const handleEdit = (item: MateriItem) => {
    setEditing(item);
    setForm({
      bab_id: item.bab_id,
      sub_bab_key: item.sub_bab_key || "",
      type: item.type,
      content_id: item.content_id,
      content_en: item.content_en || "",
      summary_id: item.summary_id || "",
      summary_en: item.summary_en || "",
      video_url: (item.metadata?.video_url as string) || "",
      animation_type: (item.metadata?.animation_type as string) || "",
    });
    setShowEditor(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...(editing ? { id: editing.id } : {}),
        bab_id: form.bab_id,
        sub_bab_key: form.sub_bab_key,
        type: form.type,
        content_id: form.content_id,
        content_en: form.content_en,
        summary_id: form.summary_id,
        summary_en: form.summary_en,
        metadata: {
          video_url: form.video_url,
          animation_type: form.animation_type,
        },
      };

      const res = await fetch("/api/admin/materi", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed");
      }
      showToast(editing ? "Materi berhasil diupdate!" : "Materi berhasil ditambahkan!");
      setShowEditor(false);
      loadMateri();
    } catch (e) {
      showToast(`Gagal menyimpan materi: ${e instanceof Error ? e.message : "Unknown"}`);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/admin/materi?id=${deleting.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      showToast("Materi berhasil dihapus!");
      setShowDelete(false);
      setDeleting(null);
      loadMateri();
    } catch {
      showToast("Gagal menghapus materi");
    }
  };

  const columns: Column<MateriItem>[] = [
    {
      key: "bab_id",
      label: "Bab",
      sortable: true,
      render: (row) => {
        const bab = babList.find((b) => b.id === row.bab_id);
        return (
          <span className="flex items-center gap-2">
            <span>{bab?.icon || "📚"}</span>
            <span className="font-medium">{bab?.id || row.bab_id}</span>
          </span>
        );
      },
    },
    { key: "sub_bab_key", label: "Sub Bab", sortable: true },
    {
      key: "type",
      label: "Tipe",
      render: (row) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
          {row.type}
        </span>
      ),
    },
    {
      key: "content_id",
      label: "Konten (ID)",
      render: (row) => (
        <span className="text-xs text-muted max-w-[200px] truncate block">
          {row.content_id?.replace(/<[^>]*>/g, "").substring(0, 60)}...
        </span>
      ),
    },
    {
      key: "sort_order",
      label: "Urutan",
      sortable: true,
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Materi"
        description="Kelola konten materi pembelajaran"
        action={{ label: "Tambah Materi", onClick: handleAdd }}
      />

      {/* Filter Bab */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterBab("")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            !filterBab ? "bg-accent text-white" : "bg-surface border border-border text-muted hover:text-ink"
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
                ? "bg-accent text-white"
                : "bg-surface border border-border text-muted hover:text-ink"
            }`}
          >
            {bab.icon} {bab.id}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={materi as any}
        loading={loading}
        searchPlaceholder="Cari materi..."
        emptyMessage="Belum ada materi. Klik 'Tambah Materi' untuk menambahkan."
        actions={(row) => (
          <div className="flex items-center gap-1">
            <button onClick={() => handleEdit(row)} className="p-1.5 rounded-lg hover:bg-bg-alt text-muted" title="Edit">
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
      <Modal open={showEditor} onClose={() => setShowEditor(false)} title={editing ? "Edit Materi" : "Tambah Materi"} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Bab</label>
              <select
                value={form.bab_id}
                onChange={(e) => setForm({ ...form, bab_id: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                {babList.map((bab) => (
                  <option key={bab.id} value={bab.id}>{bab.icon} {bab.id}</option>
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
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Video URL (opsional)</label>
              <input
                type="text"
                value={form.video_url}
                onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Ringkasan (ID)</label>
            <input
              type="text"
              value={form.summary_id}
              onChange={(e) => setForm({ ...form, summary_id: e.target.value })}
              placeholder="Ringkasan singkat materi..."
              className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Ringkasan (EN)</label>
            <input
              type="text"
              value={form.summary_en}
              onChange={(e) => setForm({ ...form, summary_en: e.target.value })}
              placeholder="Short summary..."
              className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Konten (ID) — HTML
            </label>
            <textarea
              value={form.content_id}
              onChange={(e) => setForm({ ...form, content_id: e.target.value })}
              rows={8}
              placeholder='<h3>Judul</h3><p>Isi materi dalam HTML...</p>'
              className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/30 resize-y"
            />
            <p className="text-xs text-muted mt-1">
              Gunakan HTML untuk formatting. Contoh: &lt;h3&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Konten (EN) — HTML
            </label>
            <textarea
              value={form.content_en}
              onChange={(e) => setForm({ ...form, content_en: e.target.value })}
              rows={8}
              placeholder='<h3>Title</h3><p>Content in English...</p>'
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

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={() => setShowEditor(false)}
              className="px-4 py-2.5 text-sm border border-border rounded-xl hover:bg-bg-alt transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors"
            >
              <Save className="w-4 h-4" />
              Simpan
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Hapus Materi"
        message={`Yakin ingin menghapus materi ini? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
