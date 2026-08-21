"use client";

import { useState, useEffect } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Lock, Save, Shield, Key } from "lucide-react";
import { showToast } from "@/components/ui/toaster";
import { adminFetch } from "@/lib/admin-fetch";

interface SecuritySettings {
  two_factor: boolean;
  session_timeout: number;
  max_login_attempts: number;
}

const DEFAULT_SETTINGS: SecuritySettings = {
  two_factor: false,
  session_timeout: 30,
  max_login_attempts: 5,
};

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState<SecuritySettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch("/api/admin/settings?key=security");
        const data = await res.json();
        if (data.settings?.value) {
          setSettings({ ...DEFAULT_SETTINGS, ...data.settings.value });
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
        body: JSON.stringify({ key: "security", value: settings }),
      });
      if (!res.ok) throw new Error("gagal");
      showToast("Pengaturan keamanan disimpan!");
    } catch {
      showToast("Gagal menyimpan pengaturan keamanan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted">
        Memuat pengaturan...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Security Settings"
        description="Pengaturan keamanan platform"
      />

      <div className="max-w-2xl space-y-6">
        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent" />
            Autentikasi
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">Two-Factor Authentication</p>
                <p className="text-xs text-muted">Tambahkan lapisan keamanan ekstra</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, two_factor: !settings.two_factor })}
                className={`w-11 h-6 rounded-full transition-colors ${
                  settings.two_factor ? "bg-accent" : "bg-border"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    settings.two_factor ? "translate-x-5.5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Session Timeout (menit)
              </label>
              <input
                type="number"
                value={String(settings.session_timeout)}
                onChange={(e) => setSettings({ ...settings, session_timeout: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-alt text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={String(settings.max_login_attempts)}
                onChange={(e) => setSettings({ ...settings, max_login_attempts: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-alt text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-6">
          <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
            <Key className="w-4 h-4 text-accent" />
            Password Policy
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              <div className="w-2 h-2 rounded-full bg-green" />
              Minimal 8 karakter
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <div className="w-2 h-2 rounded-full bg-green" />
              Harus mengandung huruf besar dan kecil
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <div className="w-2 h-2 rounded-full bg-green" />
              Harus mengandung angka
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
      </div>
    </div>
  );
}