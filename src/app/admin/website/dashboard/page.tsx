"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Layout, Save, RotateCcw, Megaphone, Sparkles, Eye, Info } from "lucide-react";
import { showToast } from "@/components/ui/toaster";
import { adminFetch } from "@/lib/admin-fetch";
import {
  DashboardSettings,
  DEFAULT_DASHBOARD_SETTINGS,
  updateDashboardSettingsCache,
} from "@/store/use-dashboard-settings";

const PLACEHOLDER_DEFAULTS = {
  welcome_title: 'Selamat Datang di <span class="text-accent font-extrabold">BioLearn</span>',
  welcome_desc:
    "Pembelajaran biologi interaktif untuk SMA & persiapan kuliah. Jelajahi, belajar, uji pemahamanmu!",
  banner_badge: "STAY TUNED",
  banner_title: "Materi baru segera hadir",
  banner_desc: "Kami akan menambahkan materi bab baru secara berkala.",
  banner_cta: "Nantikan update selanjutnya!",
};

export default function AdminDashboardSettingsPage() {
  const [form, setForm] = useState<DashboardSettings>(DEFAULT_DASHBOARD_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch("/api/admin/settings?key=dashboard");
        const data = await res.json();
        if (data.settings?.value) {
          setForm({
            ...DEFAULT_DASHBOARD_SETTINGS,
            ...data.settings.value,
          });
        }
      } catch {
        // use defaults
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await adminFetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "dashboard", value: form }),
      });
      if (!res.ok) throw new Error("gagal");
      updateDashboardSettingsCache(form);
      showToast("Pengaturan dashboard berhasil disimpan!");
    } catch {
      showToast("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset pengaturan dashboard ke teks default aplikasi?")) {
      setForm(DEFAULT_DASHBOARD_SETTINGS);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted">
        Memuat pengaturan dashboard...
      </div>
    );
  }

  // Preview computations
  const previewTitle = form.welcome_title?.trim() || PLACEHOLDER_DEFAULTS.welcome_title;
  const previewDesc = form.welcome_desc?.trim() || PLACEHOLDER_DEFAULTS.welcome_desc;
  const previewBadge = form.banner_badge?.trim() || PLACEHOLDER_DEFAULTS.banner_badge;
  const previewBannerTitle = form.banner_title?.trim() || PLACEHOLDER_DEFAULTS.banner_title;
  const previewBannerDesc = form.banner_desc?.trim() || PLACEHOLDER_DEFAULTS.banner_desc;
  const previewCta = form.banner_cta !== undefined && form.banner_cta !== ""
    ? form.banner_cta
    : PLACEHOLDER_DEFAULTS.banner_cta;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pengaturan Dashboard Siswa"
        description="Atur pesan sambutan dan banner pengumuman (Stay Tuned) yang muncul di halaman dashboard siswa"
        action={{
          label: saving ? "Menyimpan..." : "Simpan Perubahan",
          onClick: handleSave,
          icon: <Save className="w-4 h-4" />,
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Sambutan Header */}
          <div className="bg-surface rounded-2xl border border-border p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-border/60">
              <Layout className="w-5 h-5 text-accent" />
              <div>
                <h3 className="text-sm font-bold text-ink">Header Sambutan Dashboard</h3>
                <p className="text-xs text-muted">Teks pengantar di bagian paling atas halaman dashboard</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Judul Sambutan
              </label>
              <input
                type="text"
                value={form.welcome_title || ""}
                onChange={(e) => setForm({ ...form, welcome_title: e.target.value })}
                placeholder={PLACEHOLDER_DEFAULTS.welcome_title}
                className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 font-mono text-xs sm:text-sm"
              />
              <p className="text-[11px] text-muted mt-1">
                Kosongkan untuk memakai default. Mendukung tag HTML seperti <code>&lt;span class=&quot;highlight&quot;&gt;...&lt;/span&gt;</code>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Deskripsi / Subjudul
              </label>
              <textarea
                value={form.welcome_desc || ""}
                onChange={(e) => setForm({ ...form, welcome_desc: e.target.value })}
                placeholder={PLACEHOLDER_DEFAULTS.welcome_desc}
                rows={3}
                className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 min-h-[75px] resize-y"
              />
              <p className="text-[11px] text-muted mt-1">
                Kosongkan untuk memakai teks default bahasa aplikasi.
              </p>
            </div>
          </div>

          {/* Card 2: Banner Stay Tuned */}
          <div className="bg-surface rounded-2xl border border-border p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-sm font-bold text-ink">Banner Pengumuman (Stay Tuned)</h3>
                  <p className="text-xs text-muted">Kotak oranye informasi materi baru di bawah header</p>
                </div>
              </div>

              {/* Toggle switch */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-xs font-medium text-muted">
                  {form.show_banner ? "Aktif" : "Nonaktif"}
                </span>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, show_banner: !form.show_banner })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form.show_banner ? "bg-amber-500" : "bg-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form.show_banner ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </label>
            </div>

            {form.show_banner ? (
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                      Badge Label
                    </label>
                    <input
                      type="text"
                      value={form.banner_badge || ""}
                      onChange={(e) => setForm({ ...form, banner_badge: e.target.value })}
                      placeholder={PLACEHOLDER_DEFAULTS.banner_badge}
                      className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1.5">
                      Sub-Judul / Label Samping
                    </label>
                    <input
                      type="text"
                      value={form.banner_title || ""}
                      onChange={(e) => setForm({ ...form, banner_title: e.target.value })}
                      placeholder={PLACEHOLDER_DEFAULTS.banner_title}
                      className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    Isi Pesan Banner
                  </label>
                  <textarea
                    value={form.banner_desc || ""}
                    onChange={(e) => setForm({ ...form, banner_desc: e.target.value })}
                    placeholder={PLACEHOLDER_DEFAULTS.banner_desc}
                    rows={2}
                    className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 min-h-[60px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1.5">
                    Teks Highlight / CTA
                  </label>
                  <input
                    type="text"
                    value={form.banner_cta || ""}
                    onChange={(e) => setForm({ ...form, banner_cta: e.target.value })}
                    placeholder={PLACEHOLDER_DEFAULTS.banner_cta}
                    className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                  <p className="text-[11px] text-muted mt-1">
                    Teks yang disertai ikon bintang ✨ di samping pesan.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-bg-alt rounded-xl border border-dashed border-border text-center text-xs text-muted">
                Banner saat ini <strong>dinonaktifkan</strong> dan tidak akan muncul di dashboard siswa.
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-border rounded-xl text-xs font-medium text-muted hover:text-ink hover:bg-bg-alt transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset ke Default
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>

        {/* Right Column: 5 cols — Live Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6 bg-surface rounded-2xl border border-border p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-accent" />
                <h3 className="text-sm font-bold text-ink">Pratinjau Langsung (Preview)</h3>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">
                Live
              </span>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Ini adalah tampilan persis seperti yang akan dilihat siswa di halaman <strong>/dashboard</strong>.
            </p>

            {/* Simulated Dashboard View */}
            <div className="p-4 rounded-2xl bg-bg border border-border/70 space-y-3">
              <div>
                <h2
                  className="text-lg font-extrabold text-ink leading-tight mb-1"
                  dangerouslySetInnerHTML={{ __html: previewTitle }}
                />
                <p className="text-xs text-muted leading-relaxed">
                  {previewDesc}
                </p>
              </div>

              {form.show_banner ? (
                <div className="relative overflow-hidden flex items-start gap-2.5 px-3.5 py-3 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 border border-amber-200/60 shadow-xs">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xs">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500 text-white">
                        {previewBadge}
                      </span>
                      <span className="text-[9px] font-semibold text-amber-700">
                        {previewBannerTitle}
                      </span>
                    </div>
                    <p className="text-xs text-ink leading-snug">
                      {previewBannerDesc}
                      {previewCta && (
                        <span className="inline-flex items-center gap-0.5 ml-1 text-amber-600 font-semibold text-[11px]">
                          <Sparkles className="w-2.5 h-2.5" /> {previewCta}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-3 px-3 bg-white/50 border border-dashed border-border rounded-xl text-center text-[11px] text-muted italic">
                  (Banner disembunyikan)
                </div>
              )}
            </div>

            <div className="flex items-start gap-2 p-3 bg-accent/5 rounded-xl border border-accent/15 text-[11px] text-muted">
              <Info className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              <span>
                Perubahan yang disimpan langsung berlaku untuk seluruh siswa tanpa perlu build ulang aplikasi.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
