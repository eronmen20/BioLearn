"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, Column } from "@/components/admin/data-table";
import { StatsCard } from "@/components/admin/stats-card";
import { Modal, ConfirmDialog } from "@/components/admin/modal";
import {
  MessageSquareHeart,
  Star,
  Trash2,
  Eye,
  RefreshCw,
  Mail,
  ExternalLink,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";
import { showToast } from "@/components/ui/toaster";
import { CustomSelect } from "@/components/ui/custom-select";
import { adminFetch } from "@/lib/admin-fetch";

interface FeedbackItem {
  id: string;
  rating: number;
  category: string;
  message: string;
  name?: string | null;
  email?: string | null;
  page_url?: string | null;
  source?: string | null;
  created_at: string;
}

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  general: { label: "Umum", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  bug: { label: "Bug / Error", color: "bg-red-500/10 text-red-600 border-red-500/20" },
  feature: { label: "Saran Fitur", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  content: { label: "Materi & Kuis", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  ui: { label: "Tampilan / UI", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
};

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<FeedbackItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/admin/feedback");
      const data = await res.json();
      setFeedbacks(data.feedbacks || []);
    } catch {
      setFeedbacks([]);
      showToast("Gagal memuat data feedback.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = feedbacks.length;
    if (total === 0) return { total: 0, avgRating: "-", topCategory: "-", bugsCount: 0 };

    const sumRating = feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
    const avgRating = (sumRating / total).toFixed(1);

    const counts: Record<string, number> = {};
    feedbacks.forEach((f) => {
      const cat = f.category || "general";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    let topCatKey = "-";
    let maxCount = 0;
    Object.entries(counts).forEach(([k, v]) => {
      if (v > maxCount) {
        maxCount = v;
        topCatKey = k;
      }
    });

    return {
      total,
      avgRating: `${avgRating} / 5`,
      topCategory: CATEGORY_MAP[topCatKey]?.label || topCatKey,
      bugsCount: counts["bug"] || 0,
    };
  }, [feedbacks]);

  // Filtered feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((f) => {
      if (categoryFilter !== "all" && f.category !== categoryFilter) return false;
      if (ratingFilter !== "all" && f.rating !== Number(ratingFilter)) return false;
      return true;
    });
  }, [feedbacks, categoryFilter, ratingFilter]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      const res = await adminFetch(`/api/admin/feedback?id=${itemToDelete.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFeedbacks((prev) => prev.filter((f) => f.id !== itemToDelete.id));
        showToast("Feedback berhasil dihapus.");
        setItemToDelete(null);
      } else {
        showToast("Gagal menghapus feedback.");
      }
    } catch {
      showToast("Gagal menghapus feedback.");
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<FeedbackItem>[] = [
    {
      key: "rating",
      label: "Rating",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1 font-semibold text-amber-500">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>{row.rating}/5</span>
        </div>
      ),
    },
    {
      key: "category",
      label: "Kategori",
      sortable: true,
      render: (row) => {
        const cat = CATEGORY_MAP[row.category] || { label: row.category, color: "bg-gray-100 text-gray-700" };
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cat.color}`}>
            {cat.label}
          </span>
        );
      },
    },
    {
      key: "message",
      label: "Pesan",
      render: (row) => (
        <div className="max-w-xs md:max-w-md truncate text-ink/90 font-medium text-xs sm:text-sm">
          {row.message}
        </div>
      ),
    },
    {
      key: "name",
      label: "Pengirim",
      render: (row) => (
        <div className="text-xs">
          <div className="font-semibold text-ink">{row.name || "Anonim"}</div>
          {row.email && <div className="text-muted text-[11px] truncate">{row.email}</div>}
        </div>
      ),
    },
    {
      key: "page_url",
      label: "Halaman",
      render: (row) => (
        <span className="text-[11px] font-mono bg-surface-2 px-2 py-0.5 rounded text-muted border border-border/60">
          {row.page_url || "/"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Tanggal",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-muted whitespace-nowrap">
          {new Date(row.created_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Feedback Pengguna"
        description="Pantau ulasan kepuasan, masukan, dan laporan kendala dari pengguna BioLearn."
        action={{
          label: "Refresh Data",
          onClick: fetchFeedbacks,
          icon: <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />,
        }}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Feedback"
          value={stats.total}
          icon={MessageSquareHeart}
          color="accent"
          loading={loading}
        />
        <StatsCard
          title="Rata-rata Rating"
          value={stats.avgRating}
          icon={Star}
          color="yellow"
          loading={loading}
        />
        <StatsCard
          title="Topik Terbanyak"
          value={stats.topCategory}
          icon={MessageCircle}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Laporan Masalah / Bug"
          value={stats.bugsCount}
          icon={AlertTriangle}
          color="red"
          loading={loading}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-surface border border-border/80 shadow-sm">
        <span className="text-xs font-bold text-muted uppercase tracking-wider">Filter:</span>
        <CustomSelect
          value={categoryFilter}
          onChange={(val) => setCategoryFilter(val)}
          size="sm"
          className="w-44"
          options={[
            { value: "all", label: "Semua Kategori" },
            { value: "general", label: "Umum" },
            { value: "bug", label: "Bug / Error" },
            { value: "feature", label: "Saran Fitur" },
            { value: "content", label: "Materi & Kuis" },
            { value: "ui", label: "Tampilan / UI" },
          ]}
        />

        <CustomSelect
          value={ratingFilter}
          onChange={(val) => setRatingFilter(val)}
          size="sm"
          className="w-52"
          options={[
            { value: "all", label: "Semua Rating" },
            { value: "5", label: "⭐⭐⭐⭐⭐ (5 Bintang)" },
            { value: "4", label: "⭐⭐⭐⭐ (4 Bintang)" },
            { value: "3", label: "⭐⭐⭐ (3 Bintang)" },
            { value: "2", label: "⭐⭐ (2 Bintang)" },
            { value: "1", label: "⭐ (1 Bintang)" },
          ]}
        />

        <div className="ml-auto text-xs text-muted">
          Menampilkan <strong>{filteredFeedbacks.length}</strong> dari <strong>{feedbacks.length}</strong> feedback
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredFeedbacks}
        loading={loading}
        searchable
        searchPlaceholder="Cari berdasarkan pesan, nama, atau email..."
        searchKeys={["message", "name", "email", "category"]}
        emptyMessage="Belum ada feedback yang masuk."
        actions={(row) => (
          <div className="flex items-center gap-1.5 justify-end">
            <button
              onClick={() => setSelectedItem(row)}
              className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
              title="Lihat Detail"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setItemToDelete(row)}
              className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
              title="Hapus Feedback"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Detail Modal */}
      {selectedItem && (
        <Modal
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title="Detail Feedback Pengguna"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-2 border border-border/60">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-5 h-5 ${
                        s <= selectedItem.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-border"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-ink">({selectedItem.rating}/5)</span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  CATEGORY_MAP[selectedItem.category]?.color || "bg-gray-100 text-gray-700"
                }`}
              >
                {CATEGORY_MAP[selectedItem.category]?.label || selectedItem.category}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1">
                Isi Masukan
              </label>
              <div className="p-4 rounded-2xl bg-surface-2 border border-border text-sm text-ink whitespace-pre-wrap leading-relaxed">
                {selectedItem.message}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-2 border border-border/50">
                <span className="text-muted block mb-0.5">Pengirim:</span>
                <span className="font-semibold text-ink">{selectedItem.name || "Anonim"}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-2 border border-border/50">
                <span className="text-muted block mb-0.5">Email:</span>
                <span className="font-semibold text-ink">
                  {selectedItem.email ? (
                    <a
                      href={`mailto:${selectedItem.email}`}
                      className="text-accent hover:underline inline-flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                      {selectedItem.email}
                    </a>
                  ) : (
                    "-"
                  )}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface-2 border border-border/50">
                <span className="text-muted block mb-0.5">Halaman Asal:</span>
                <span className="font-semibold text-ink font-mono">{selectedItem.page_url || "/"}</span>
              </div>
              <div className="p-3 rounded-xl bg-surface-2 border border-border/50">
                <span className="text-muted block mb-0.5">Waktu Kirim:</span>
                <span className="font-semibold text-ink">
                  {new Date(selectedItem.created_at).toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
              {selectedItem.email && (
                <a
                  href={`mailto:${selectedItem.email}?subject=Tanggapan%20Feedback%20BioLearn&body=Halo%20${encodeURIComponent(
                    selectedItem.name || ""
                  )},%0D%0ATerima%20kasih%20atas%20feedback%20kamu%20di%20BioLearn...`}
                  className="px-4 py-2 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent-dark transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Balas via Email
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl bg-surface-2 hover:bg-border/60 text-ink text-xs font-semibold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {itemToDelete && (
        <ConfirmDialog
          open={!!itemToDelete}
          title="Hapus Feedback"
          message="Apakah kamu yakin ingin menghapus data feedback ini? Tindakan ini tidak dapat dibatalkan."
          confirmLabel="Hapus"
          variant="danger"
          loading={deleting}
          onConfirm={handleDelete}
          onClose={() => setItemToDelete(null)}
        />
      )}
    </div>
  );
}
