'use client';

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { Settings, Save, Eye, Layout, Type, Image, Layers, FlaskConical, HelpCircle, Newspaper, Megaphone } from 'lucide-react';
import { showToast } from '@/components/ui/toaster';
import { adminFetch } from "@/lib/admin-fetch";

interface HomepageSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_cta: string;
  show_banner: boolean;
  show_pengumuman: boolean;
  show_materi_terbaru: boolean;
  show_statistik: boolean;
  meta_title: string;
  meta_description: string;
  // Section konsep — opsional; kosong = pakai teks default website
  pillars_title?: string;
  pillars_desc?: string;
  pillar1_title?: string;
  pillar1_desc?: string;
  pillar2_title?: string;
  pillar2_desc?: string;
  pillar3_title?: string;
  pillar3_desc?: string;
  modes_eyebrow?: string;
  modes_title?: string;
  modes_desc?: string;
  tab_lihat_title?: string;
  tab_lihat_desc?: string;
  tab_coba_title?: string;
  tab_coba_desc?: string;
  tab_isu_title?: string;
  tab_isu_desc?: string;
  tab_uji_title?: string;
  tab_uji_desc?: string;
  quiz_title?: string;
  quiz_desc?: string;
  quiz_q?: string;
  quiz_opt_true?: string;
  quiz_opt_false?: string;
  quiz_explain?: string;
  quiz_answer?: number;
  issues_eyebrow?: string;
  issues_title?: string;
  issues_desc?: string;
  issue1_title?: string;
  issue1_desc?: string;
  issue2_title?: string;
  issue2_desc?: string;
  issue3_title?: string;
  issue3_desc?: string;
  issues_cta?: string;
  cta_ready?: string;
  cta_desc?: string;
  cta_register?: string;
}

function SectionCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-accent">{icon}</span>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function TextField({ label, value, onChange, textarea, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
}) {
  const cls = "w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30";
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} placeholder={placeholder} className={`${cls} min-h-[60px] resize-y`} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}

const DEFAULT_SETTINGS: HomepageSettings = {
  hero_title: 'Belajar Biologi Jadi Mudah dan Menyenangkan',
  hero_subtitle: 'Jelajahi 8 bab biologi dengan materi lengkap, kuis, animasi, dan tracking progress.\nCocok untuk siswa SMA & persiapan kuliah.',
  hero_cta: 'Mulai Belajar',
  show_banner: true,
  show_pengumuman: true,
  show_materi_terbaru: true,
  show_statistik: true,
  meta_title: 'BioLearn - Belajar Biologi Jadi Mudah',
  meta_description: 'Platform pembelajaran biologi untuk siswa SMA dengan materi lengkap dan quiz interaktif.',
  pillars_title: '',
  pillars_desc: '',
  pillar1_title: '',
  pillar1_desc: '',
  pillar2_title: '',
  pillar2_desc: '',
  pillar3_title: '',
  pillar3_desc: '',
  modes_eyebrow: '',
  modes_title: '',
  modes_desc: '',
  tab_lihat_title: '',
  tab_lihat_desc: '',
  tab_coba_title: '',
  tab_coba_desc: '',
  tab_isu_title: '',
  tab_isu_desc: '',
  tab_uji_title: '',
  tab_uji_desc: '',
  quiz_title: '',
  quiz_desc: '',
  quiz_q: '',
  quiz_opt_true: '',
  quiz_opt_false: '',
  quiz_explain: '',
  quiz_answer: 1,
  issues_eyebrow: '',
  issues_title: '',
  issues_desc: '',
  issue1_title: '',
  issue1_desc: '',
  issue2_title: '',
  issue2_desc: '',
  issue3_title: '',
  issue3_desc: '',
  issues_cta: '',
  cta_ready: '',
  cta_desc: '',
  cta_register: '',
};

export default function HomepageSettingsPage() {
  const [settings, setSettings] = useState<HomepageSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch('/api/admin/settings?key=homepage');
        const data = await res.json();
        if (data.settings?.value) {
          setSettings({ ...DEFAULT_SETTINGS, ...data.settings.value });
        }
      } catch {
        // defaults
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await adminFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'homepage', value: settings }),
      });
      if (!res.ok) throw new Error('gagal');
      showToast('Pengaturan homepage berhasil disimpan!');
    } catch {
      showToast('Gagal menyimpan pengaturan homepage');
    } finally {
      setSaving(false);
    }
  };

  // Helper generik untuk field teks baru (kosong = pakai teks default website)
  const setField = (key: string, value: string | number) => {
    setSettings({ ...settings, [key]: value } as HomepageSettings);
  };
  const str = (v: string | undefined) => v || '';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted">
        Memuat pengaturan...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Pengaturan Homepage" description="Konfigurasi tampilan halaman utama website" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hero Section */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Layout className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-ink">Hero Section</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Judul Hero</label>
            <input type="text" value={settings.hero_title} onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Deskripsi Hero</label>
            <textarea
              value={settings.hero_subtitle}
              onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
              placeholder="Jelajahi 8 bab biologi dengan materi lengkap, kuis, animasi, dan tracking progress."
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 min-h-[60px]"
            />
            <p className="text-[11px] text-muted mt-1">Pisahkan baris dengan Enter.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Teks Tombol CTA</label>
            <input type="text" value={settings.hero_cta} onChange={(e) => setSettings({ ...settings, hero_cta: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>
        </div>

        {/* SEO & Visibility */}
        <div className="space-y-6">
          <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-ink">Visibilitas Section</h3>
            </div>
            {[
              { key: 'show_banner', label: 'Tampilkan Banner' },
              { key: 'show_pengumuman', label: 'Tampilkan Pengumuman' },
              { key: 'show_materi_terbaru', label: 'Tampilkan Materi Terbaru' },
              { key: 'show_statistik', label: 'Tampilkan Statistik' },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-ink">{item.label}</span>
                <button
                  onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key as keyof typeof settings] })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    settings[item.key as keyof typeof settings] ? 'bg-accent' : 'bg-border'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      settings[item.key as keyof typeof settings] ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </label>
            ))}
          </div>

          <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Type className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-ink">SEO</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Meta Title</label>
              <input type="text" value={settings.meta_title} onChange={(e) => setSettings({ ...settings, meta_title: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Meta Description</label>
              <textarea value={settings.meta_description} onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 min-h-[80px]" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Section konsep baru (semua opsional) ── */}
      <p className="text-xs text-muted">Bagian di bawah ini opsional — kosongkan untuk memakai teks default website.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard icon={<Layers className="w-4 h-4" />} title="Tiga Pilar">
          <TextField label="Judul section" value={str(settings.pillars_title)} onChange={(v) => setField('pillars_title', v)} />
          <TextField label="Deskripsi section" value={str(settings.pillars_desc)} onChange={(v) => setField('pillars_desc', v)} textarea />
          <TextField label="Pilar 1 — Judul" value={str(settings.pillar1_title)} onChange={(v) => setField('pillar1_title', v)} />
          <TextField label="Pilar 1 — Deskripsi" value={str(settings.pillar1_desc)} onChange={(v) => setField('pillar1_desc', v)} textarea />
          <TextField label="Pilar 2 — Judul" value={str(settings.pillar2_title)} onChange={(v) => setField('pillar2_title', v)} />
          <TextField label="Pilar 2 — Deskripsi" value={str(settings.pillar2_desc)} onChange={(v) => setField('pillar2_desc', v)} textarea />
          <TextField label="Pilar 3 — Judul" value={str(settings.pillar3_title)} onChange={(v) => setField('pillar3_title', v)} />
          <TextField label="Pilar 3 — Deskripsi" value={str(settings.pillar3_desc)} onChange={(v) => setField('pillar3_desc', v)} textarea />
        </SectionCard>

        <SectionCard icon={<FlaskConical className="w-4 h-4" />} title="Cara Belajar (4 Tab)">
          <TextField label="Label kecil" value={str(settings.modes_eyebrow)} onChange={(v) => setField('modes_eyebrow', v)} />
          <TextField label="Judul section" value={str(settings.modes_title)} onChange={(v) => setField('modes_title', v)} />
          <TextField label="Deskripsi section" value={str(settings.modes_desc)} onChange={(v) => setField('modes_desc', v)} textarea />
          <TextField label="Tab 1 — Judul (Melihat)" value={str(settings.tab_lihat_title)} onChange={(v) => setField('tab_lihat_title', v)} />
          <TextField label="Tab 1 — Deskripsi" value={str(settings.tab_lihat_desc)} onChange={(v) => setField('tab_lihat_desc', v)} textarea />
          <TextField label="Tab 2 — Judul (Mencoba)" value={str(settings.tab_coba_title)} onChange={(v) => setField('tab_coba_title', v)} />
          <TextField label="Tab 2 — Deskripsi" value={str(settings.tab_coba_desc)} onChange={(v) => setField('tab_coba_desc', v)} textarea />
          <TextField label="Tab 3 — Judul (Mengaitkan)" value={str(settings.tab_isu_title)} onChange={(v) => setField('tab_isu_title', v)} />
          <TextField label="Tab 3 — Deskripsi" value={str(settings.tab_isu_desc)} onChange={(v) => setField('tab_isu_desc', v)} textarea />
          <TextField label="Tab 4 — Judul (Menguji)" value={str(settings.tab_uji_title)} onChange={(v) => setField('tab_uji_title', v)} />
          <TextField label="Tab 4 — Deskripsi" value={str(settings.tab_uji_desc)} onChange={(v) => setField('tab_uji_desc', v)} textarea />
        </SectionCard>

        <SectionCard icon={<HelpCircle className="w-4 h-4" />} title="Mini Kuis (Teaser 1 Soal)">
          <TextField label="Judul" value={str(settings.quiz_title)} onChange={(v) => setField('quiz_title', v)} />
          <TextField label="Deskripsi" value={str(settings.quiz_desc)} onChange={(v) => setField('quiz_desc', v)} textarea />
          <TextField label="Pertanyaan" value={str(settings.quiz_q)} onChange={(v) => setField('quiz_q', v)} textarea />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Opsi 1" value={str(settings.quiz_opt_true)} onChange={(v) => setField('quiz_opt_true', v)} />
            <TextField label="Opsi 2" value={str(settings.quiz_opt_false)} onChange={(v) => setField('quiz_opt_false', v)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Jawaban benar</label>
            <select
              value={settings.quiz_answer ?? 1}
              onChange={(e) => setField('quiz_answer', Number(e.target.value))}
              className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value={0}>Opsi 1</option>
              <option value={1}>Opsi 2</option>
            </select>
          </div>
          <TextField label="Pembahasan (tampil bila jawaban salah)" value={str(settings.quiz_explain)} onChange={(v) => setField('quiz_explain', v)} textarea />
        </SectionCard>

        <SectionCard icon={<Newspaper className="w-4 h-4" />} title="Isu Dunia Nyata (3 Kartu)">
          <TextField label="Label kecil" value={str(settings.issues_eyebrow)} onChange={(v) => setField('issues_eyebrow', v)} />
          <TextField label="Judul section" value={str(settings.issues_title)} onChange={(v) => setField('issues_title', v)} />
          <TextField label="Deskripsi section" value={str(settings.issues_desc)} onChange={(v) => setField('issues_desc', v)} textarea />
          <TextField label="Isu 1 — Judul" value={str(settings.issue1_title)} onChange={(v) => setField('issue1_title', v)} />
          <TextField label="Isu 1 — Deskripsi" value={str(settings.issue1_desc)} onChange={(v) => setField('issue1_desc', v)} textarea />
          <TextField label="Isu 2 — Judul" value={str(settings.issue2_title)} onChange={(v) => setField('issue2_title', v)} />
          <TextField label="Isu 2 — Deskripsi" value={str(settings.issue2_desc)} onChange={(v) => setField('issue2_desc', v)} textarea />
          <TextField label="Isu 3 — Judul" value={str(settings.issue3_title)} onChange={(v) => setField('issue3_title', v)} />
          <TextField label="Isu 3 — Deskripsi" value={str(settings.issue3_desc)} onChange={(v) => setField('issue3_desc', v)} textarea />
          <TextField label="Teks tombol kartu" value={str(settings.issues_cta)} onChange={(v) => setField('issues_cta', v)} />
        </SectionCard>

        <SectionCard icon={<Megaphone className="w-4 h-4" />} title="CTA Akhir">
          <TextField label="Judul" value={str(settings.cta_ready)} onChange={(v) => setField('cta_ready', v)} />
          <TextField label="Deskripsi" value={str(settings.cta_desc)} onChange={(v) => setField('cta_desc', v)} textarea />
          <TextField label="Teks tombol" value={str(settings.cta_register)} onChange={(v) => setField('cta_register', v)} />
        </SectionCard>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50">
          <Save className="w-4 h-4" />
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>
    </div>
  );
}