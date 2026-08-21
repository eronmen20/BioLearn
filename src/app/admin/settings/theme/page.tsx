'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { Palette, Save, Sun, Moon, Monitor, Check, Loader2 } from 'lucide-react';
import { showToast } from '@/components/ui/toaster';
import { useThemeStore, type Theme } from '@/lib/theme-store';
import { adminFetch } from "@/lib/admin-fetch";

interface ColorPreset {
  name: string;
  primary: string;
  secondary: string;
  bg: string;
}

const DEFAULT_PRESETS: ColorPreset[] = [
  { name: 'Violet', primary: '#6c5ce7', secondary: '#a29bfe', bg: '#f8f7ff' },
  { name: 'Blue', primary: '#3b82f6', secondary: '#93c5fd', bg: '#eff6ff' },
  { name: 'Green', primary: '#10b981', secondary: '#6ee7b7', bg: '#ecfdf5' },
  { name: 'Rose', primary: '#f43f5e', secondary: '#fda4af', bg: '#fff1f2' },
  { name: 'Amber', primary: '#f59e0b', secondary: '#fcd34d', bg: '#fffbeb' },
  { name: 'Teal', primary: '#14b8a6', secondary: '#5eead4', bg: '#f0fdfa' },
];

export default function ThemeSettingsPage() {
  const { theme, resolved, setTheme } = useThemeStore();
  const [presets, setPresets] = useState<ColorPreset[]>(DEFAULT_PRESETS);
  const [activePreset, setActivePreset] = useState<string>('Violet');
  const [customPrimary, setCustomPrimary] = useState('#6c5ce7');
  const [customSecondary, setCustomSecondary] = useState('#a29bfe');
  const [customBg, setCustomBg] = useState('#f8f7ff');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch via API route instead of direct Supabase
      const res = await adminFetch('/api/admin/settings?key=theme_presets');
      const data = await res.json();
      if (data.settings?.value) {
        setPresets(data.settings.value);
      }

      const res2 = await adminFetch('/api/admin/settings?key=active_theme');
      const data2 = await res2.json();
      if (data2.settings?.value) {
        setActivePreset(data2.settings.value.preset || 'Violet');
        if (data2.settings.value.custom) {
          setCustomPrimary(data2.settings.value.custom.primary || '#6c5ce7');
          setCustomSecondary(data2.settings.value.custom.secondary || '#a29bfe');
          setCustomBg(data2.settings.value.custom.bg || '#f8f7ff');
        }
      }
    } catch {
      // Use defaults
    } finally {
      setLoading(false);
    }
  }

  async function handleApplyPreset(preset: ColorPreset) {
    setActivePreset(preset.name);
    applyColors(preset.primary, preset.secondary, preset.bg);
    await saveToDB({ preset: preset.name });
  }

  function applyColors(primary: string, secondary: string, bg: string) {
    document.documentElement.style.setProperty('--color-accent', primary);
    document.documentElement.style.setProperty('--color-accent-light', secondary);
  }

  async function saveToDB(value: Record<string, unknown>) {
    setSaving(true);
    try {
      await adminFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'active_theme', value }),
      });
      showToast('Tema berhasil disimpan!');
    } catch {
      showToast('Gagal menyimpan tema');
    } finally {
      setSaving(false);
    }
  }

  async function handleApplyCustom() {
    applyColors(customPrimary, customSecondary, customBg);
    setActivePreset('Custom');
    await saveToDB({
      preset: 'Custom',
      custom: { primary: customPrimary, secondary: customSecondary, bg: customBg },
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Theme Settings"
        description="Kustomisasi warna dan tema website"
      />

      {/* Dark/Light Mode */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-ink mb-4">Mode Tampilan</h3>
        <div className="flex gap-3">
          {[
            { key: 'light' as Theme, label: 'Terang', icon: Sun },
            { key: 'dark' as Theme, label: 'Gelap', icon: Moon },
            { key: 'system' as Theme, label: 'Sistem', icon: Monitor },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                theme === key
                  ? 'border-accent bg-accent/5 text-accent'
                  : 'border-border text-muted hover:border-accent/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
              {theme === key && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* Color Presets */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-ink mb-4">Color Presets</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleApplyPreset(preset)}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                activePreset === preset.name
                  ? 'border-accent shadow-lg'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              {activePreset === preset.name && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-accent" />
                </div>
              )}
              <div className="flex gap-2 mb-2">
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.primary }} />
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.secondary }} />
                <div className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: preset.bg }} />
              </div>
              <p className="text-sm font-semibold text-ink">{preset.name}</p>
              <p className="text-[10px] text-muted mt-0.5">{preset.primary}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-ink mb-4">Custom Colors</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs text-muted mb-1">Primary</label>
            <div className="flex gap-2">
              <input type="color" value={customPrimary} onChange={(e) => setCustomPrimary(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
              <input type="text" value={customPrimary} onChange={(e) => setCustomPrimary(e.target.value)} className="flex-1 px-2 py-1 border border-border rounded-lg text-xs font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Secondary</label>
            <div className="flex gap-2">
              <input type="color" value={customSecondary} onChange={(e) => setCustomSecondary(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
              <input type="text" value={customSecondary} onChange={(e) => setCustomSecondary(e.target.value)} className="flex-1 px-2 py-1 border border-border rounded-lg text-xs font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Background</label>
            <div className="flex gap-2">
              <input type="color" value={customBg} onChange={(e) => setCustomBg(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
              <input type="text" value={customBg} onChange={(e) => setCustomBg(e.target.value)} className="flex-1 px-2 py-1 border border-border rounded-lg text-xs font-mono" />
            </div>
          </div>
        </div>
        <button
          onClick={handleApplyCustom}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Terapkan Custom
        </button>
      </div>

      {/* Preview */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-sm font-semibold text-ink mb-4">Preview</h3>
        <div className="flex gap-3">
          <div className="flex-1 p-4 rounded-xl border border-border">
            <div className="w-8 h-8 rounded-lg mb-2" style={{ backgroundColor: customPrimary }} />
            <p className="text-xs text-muted">Primary</p>
          </div>
          <div className="flex-1 p-4 rounded-xl border border-border">
            <div className="w-8 h-8 rounded-lg mb-2" style={{ backgroundColor: customSecondary }} />
            <p className="text-xs text-muted">Secondary</p>
          </div>
          <div className="flex-1 p-4 rounded-xl border border-border" style={{ backgroundColor: customBg }}>
            <p className="text-xs text-ink">Background</p>
          </div>
        </div>
      </div>
    </div>
  );
}
