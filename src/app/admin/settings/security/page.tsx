"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Lock, Save, Shield, Key, Clock } from "lucide-react";
import { showToast } from "@/components/ui/toaster";

export default function SecuritySettingsPage() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");

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
                onClick={() => setTwoFactor(!twoFactor)}
                className={`w-11 h-6 rounded-full transition-colors ${
                  twoFactor ? "bg-accent" : "bg-border"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    twoFactor ? "translate-x-5.5" : "translate-x-0.5"
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
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-alt text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                Max Login Attempts
              </label>
              <input
                type="number"
                value={maxLoginAttempts}
                onChange={(e) => setMaxLoginAttempts(e.target.value)}
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
          onClick={() => showToast("Pengaturan keamanan disimpan")}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-dark transition-colors"
        >
          <Save className="w-4 h-4" />
          Simpan Pengaturan
        </button>
      </div>
    </div>
  );
}
