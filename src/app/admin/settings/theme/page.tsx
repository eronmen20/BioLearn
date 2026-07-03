"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Palette, Save, Sun, Moon, Monitor, Check } from "lucide-react";
import { showToast } from "@/components/ui/toaster";
import { useThemeStore, type Theme } from "@/lib/theme-store";

const COLOR_PRESETS = [
  { name: "Violet", accent: "#6c5ce7", accentDark: "#4834d4", accentLight: "#a29bfe" },
  { name: "Blue", accent: "#3b82f6", accentDark: "#2563eb", accentLight: "#93c5fd" },
  { name: "Green", accent: "#10b981", accentDark: "#059669", accentLight: "#6ee7b7" },
  { name: "Rose", accent: "#f43f5e", accentDark: "#e11d48", accentLight: "#fda4af" },
  { name: "Amber", accent: "#f59e0b", accentDark: "#d97706", accentLight: "#fcd34d" },
  { name: "Teal", accent: "#14b8a6", accentDark: "#0d9488", accentLight: "#5eead4" },
];

export default function ThemeSettingsPage() {
  const { theme, resolved, setTheme } = useThemeStore();
  const [selectedPreset, setSelectedPreset] = useState("Violet");

  const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Terang", icon: Sun },
    { value: "dark", label: "Gelap", icon: Moon },
    { value: "system", label: "Sistem", icon: Monitor },
  ];

  const handleSave = () => {
    showToast("Tema berhasil disimpan!");
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Theme Settings"
        description="Kustomisasi tampilan website"
      />

      <div className="max-w-2xl space-y-6">
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
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-border/80"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? "text-accent" : "text-muted"}`} />
                  <span className={`text-sm font-medium ${isActive ? "text-accent" : "text-ink"}`}>
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
            Saat ini: {theme === "system" ? `Sistem (${resolved})` : theme === "dark" ? "Gelap" : "Terang"}
          </p>
        </div>

        {/* Color Preset */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-ink mb-4">
            Color Preset
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setSelectedPreset(preset.name)}
                className={`relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  selectedPreset === preset.name
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-border/80"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: preset.accent }}
                />
                <span className="text-sm font-medium text-ink">
                  {preset.name}
                </span>
                {selectedPreset === preset.name && (
                  <Check className="w-4 h-4 text-accent absolute top-2 right-2" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-ink mb-4">
            Preview Warna Saat Ini
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-bg border border-border">
              <p className="text-xs text-muted mb-1">Background</p>
              <p className="text-sm font-medium text-ink">bg-bg</p>
            </div>
            <div className="p-4 rounded-xl bg-surface border border-border">
              <p className="text-xs text-muted mb-1">Surface</p>
              <p className="text-sm font-medium text-ink">bg-surface</p>
            </div>
            <div className="p-4 rounded-xl bg-accent text-white rounded-xl">
              <p className="text-xs opacity-80 mb-1">Accent</p>
              <p className="text-sm font-medium">bg-accent</p>
            </div>
            <div className="p-4 rounded-xl bg-bg-alt border border-border">
              <p className="text-xs text-muted mb-1">Background Alt</p>
              <p className="text-sm font-medium text-ink">bg-bg-alt</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors"
        >
          <Save className="w-4 h-4" />
          Simpan Tema
        </button>
      </div>
    </div>
  );
}
