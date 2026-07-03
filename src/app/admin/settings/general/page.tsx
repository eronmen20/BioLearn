'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { Settings, Save, Globe, Clock, Languages, Mail } from 'lucide-react';

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState({
    site_name: 'BioLearn',
    site_url: 'https://biolearn.com',
    description: 'Platform Belajar Biologi Interaktif',
    language: 'id',
    timezone: 'Asia/Jakarta',
    contact_email: 'admin@biolearn.com',
    maintenance_mode: false,
    registration_open: true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Pengaturan Umum" description="Konfigurasi dasar platform BioLearn" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-ink">Informasi Situs</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Nama Situs</label>
            <input type="text" value={settings.site_name} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">URL Situs</label>
            <input type="url" value={settings.site_url} onChange={(e) => setSettings({ ...settings, site_url: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Deskripsi</label>
            <textarea value={settings.description} onChange={(e) => setSettings({ ...settings, description: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 min-h-[80px]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Email Kontak</label>
            <input type="email" value={settings.contact_email} onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-ink">Regional</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Bahasa</label>
              <select value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Zona Waktu</label>
              <select value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} className="w-full px-3 py-2 border border-border rounded-xl bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30">
                <option value="Asia/Jakarta">WIB (Jakarta)</option>
                <option value="Asia/Makassar">WITA (Makassar)</option>
                <option value="Asia/Jayapura">WIT (Jayapura)</option>
              </select>
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-ink">Opsi Platform</h3>
            </div>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-ink">Mode Maintenance</span>
              <button onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })} className={`relative w-11 h-6 rounded-full transition-colors ${settings.maintenance_mode ? 'bg-red' : 'bg-border'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.maintenance_mode ? 'translate-x-5' : ''}`} />
              </button>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-ink">Buka Registrasi</span>
              <button onClick={() => setSettings({ ...settings, registration_open: !settings.registration_open })} className={`relative w-11 h-6 rounded-full transition-colors ${settings.registration_open ? 'bg-green' : 'bg-border'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.registration_open ? 'translate-x-5' : ''}`} />
              </button>
            </label>
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
