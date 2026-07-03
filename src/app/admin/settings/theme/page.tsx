'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader } from '@/components/admin/page-header';
import { Palette, Save, Sun, Moon, Monitor, Check, Loader2 } from 'lucide-react';
import { showToast } from '@/components/ui/toaster';
import { useThemeStore, type Theme } from '@/lib/theme-store';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
      const { data: presetsData } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'theme_presets')
        .single();

      if (presetsData?.value) {
        const p = Array.isArray(presetsData.value) ? presetsData.value : DEFAULT_PRESETS;
        setPresets(p);
      }

      const { data: activeData } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'active_theme')
        .single();

      if (activeData?.value) {
        const v = activeData.value as ColorPreset;
        setActivePreset(v.name || 'Violet');
        setCustomPrimary(v.primary || '#6c5ce7');
        setCustomSecondary(v.secondary || '#a29bfe');
        setCustomBg(v.bg || '#f8f7ff');
      }
    } catch (e) {
      // use defaults
    } finally {
      setLoading(false);
    }
  }

  const applyPreset = async (preset: ColorPreset) => {
    setActivePreset(preset.name);
    setCustomPrimary(preset.primary);
    setCustomSecondary(preset.secondary);
    setCustomBg(preset.bg);
    await saveTheme(preset);
  };

  const saveTheme = async (preset: ColorPreset) => {
    setSaving(true);
    try {
      await supabase.from('site_settings').upsert({
        key: 'active_theme',
        value: preset,
      });
      showToast('Tema berhasil diterapkan!');
    } catch {
      showToast('Gagal menyimpan tema');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCustom = () => {
    const custom: ColorPreset = {
      name: 'Custom',
      primary: customPrimary,
      secondary: customSecondary,
      bg: customBg,
    };
    setActivePreset('Custom');
    saveTheme(custom);
  };

  const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Terang', icon: Sun },
    { value: 'dark', label: 'Gelap', icon: Moon },
    { value: 'system', label: 'Sistem', icon: Monitor },
  ];

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
        description="Kustomisasi tampilan dan warna website"
      />

      <div className="max-w-3xl space-y-6">
        {/* Mode Selection */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <Palette className="w-4 h-4 text-accent" />
            Mode Tampilan
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    isActive
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-border/80'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'text-accent' : 'text-muted'}`} />
                  <span className={`text-sm font-medium ${isActive ? 'text-accent' : 'text-ink'}`}>
                    {opt.label}
                  </span>
                  {isActive && (
                    <Check className="w-4 h-4 text-accent absolute top-2 right-2" />
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted mt-3">
            Saat ini: {theme === 'system' ? `Sistem (${resolved})` : theme === 'dark' ? 'Gelap' : 'Terang'}
          </p>
        </div>

        {/* Color Presets from DB */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-ink mb-4">
            Color Preset
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  activePreset === preset.name
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-border/80'
                }`}
              >
                <div className="flex gap-1 flex-shrink-0">
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.primary }} />
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.secondary }} />
                </div>
                <span className="text-sm font-medium text-ink">{preset.name}</span>
                {activePreset === preset.name && (
                  <Check className="w-4 h-4 text-accent absolute top-2 right-2" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Color Picker */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-ink mb-4">
            Warna Kustom
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs text-muted mb-2 block">Warna Primer</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customPrimary}
                  onChange={(e) => setCustomPrimary(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-border"
                />
                <input
                  type="text"
                  value={customPrimary}
                  onChange={(e) => setCustomPrimary(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-bg-alt border border-border text-sm text-ink font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted mb-2 block">Warna Sekunder</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customSecondary}
                  onChange={(e) => setCustomSecondary(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-border"
                />
                <input
                  type="text"
                  value={customSecondary}
                  onChange={(e) => setCustomSecondary(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-bg-alt border border-border text-sm text-ink font-mono"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted mb-2 block">Warna Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customBg}
                  onChange={(e) => setCustomBg(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-border"
                />
                <input
                  type="text"
                  value={customBg}
                  onChange={(e) => setCustomBg(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-bg-alt border border-border text-sm text-ink font-mono"
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleSaveCustom}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Terapkan Warna Kustom
          </button>
        </div>

        {/* Preview */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-ink mb-4">
            Preview Warna
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-border" style={{ backgroundColor: customBg }}>
              <p className="text-xs mb-1" style={{ color: customPrimary }}>Background</p>
              <p className="text-sm font-mono text-ink">{customBg}</p>
            </div>
            <div className="p-4 rounded-xl text-white" style={{ backgroundColor: customPrimary }}>
              <p className="text-xs opacity-80 mb-1">Primary</p>
              <p className="text-sm font-mono">{customPrimary}</p>
            </div>
            <div className="p-4 rounded-xl text-white" style={{ backgroundColor: customSecondary }}>
              <p className="text-xs opacity-80 mb-1">Secondary</p>
              <p className="text-sm font-mono">{customSecondary}</p>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-xl border border-border" style={{ backgroundColor: customBg }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: customPrimary }}>
                BL
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: customPrimary }}>BioLearn</p>
                <p className="text-xs" style={{ color: customSecondary }}>Preview Kartu</p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: customPrimary }}>
              Tombol Primer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
