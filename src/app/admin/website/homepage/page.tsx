'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { Settings, Save, Eye, Layout, Type, Image } from 'lucide-react';

export default function HomepageSettingsPage() {
  const [settings, setSettings] = useState({
    hero_title: 'BioLearn',
    hero_subtitle: 'Platform Belajar Biologi Interaktif',
    hero_cta: 'Mulai Belajar',
    show_banner: true,
    show_pengumuman: true,
    show_materi_terbaru: true,
    show_statistik: true,
    meta_title: 'BioLearn - Belajar Biologi Jadi Mudah',
    meta_description: 'Platform pembelajaran biologi untuk siswa SMA dengan materi lengkap dan quiz interaktif.',
  });

  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

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
            <label className="block text-sm font-medium text-ink mb-1">Subtitle</label>
            <input type="text" value={settings.hero_subtitle} onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Teks Tombol CTA</label>
            <input type="text" value={settings.hero_cta} onChange={(e) => setSettings({ ...settings, hero_cta: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Gambar Hero</label>
            <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
              <Image className="w-6 h-6 text-muted mx-auto mb-1" />
              <p className="text-xs text-muted">Klik untuk upload gambar hero</p>
            </div>
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

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50">
          <Save className="w-4 h-4" />
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>
    </div>
  );
}
