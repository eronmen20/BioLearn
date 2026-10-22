"use client";

import { useEffect, useState } from "react";

export interface DashboardSettings {
  welcome_title?: string;
  welcome_title_en?: string;
  welcome_desc?: string;
  welcome_desc_en?: string;
  show_banner: boolean;
  banner_badge?: string;
  banner_title?: string;
  banner_desc?: string;
  banner_cta?: string;
}

export const DEFAULT_DASHBOARD_SETTINGS: DashboardSettings = {
  welcome_title: "",
  welcome_title_en: "",
  welcome_desc: "",
  welcome_desc_en: "",
  show_banner: true,
  banner_badge: "",
  banner_title: "",
  banner_desc: "",
  banner_cta: "",
};

let cachedSettings: DashboardSettings | null = null;
const listeners = new Set<(s: DashboardSettings) => void>();

export function useDashboardSettings() {
  const [settings, setSettings] = useState<DashboardSettings>(
    cachedSettings || DEFAULT_DASHBOARD_SETTINGS
  );
  const [loaded, setLoaded] = useState(cachedSettings !== null);

  useEffect(() => {
    let alive = true;
    const updateListener = (newSettings: DashboardSettings) => {
      if (alive) setSettings(newSettings);
    };
    listeners.add(updateListener);

    if (!cachedSettings) {
      fetch(`/api/site-settings?key=dashboard&_t=${Date.now()}`, {
        cache: "no-store",
      })
        .then((res) => res.json())
        .then((data) => {
          if (!alive) return;
          const val = data?.settings;
          const merged: DashboardSettings = {
            ...DEFAULT_DASHBOARD_SETTINGS,
            ...(val && typeof val === "object" ? val : {}),
          };
          cachedSettings = merged;
          setSettings(merged);
          setLoaded(true);
        })
        .catch(() => {
          if (!alive) return;
          setLoaded(true);
        });
    }

    return () => {
      alive = false;
      listeners.delete(updateListener);
    };
  }, []);

  return { settings, loaded };
}

export function updateDashboardSettingsCache(newSettings: DashboardSettings) {
  cachedSettings = newSettings;
  listeners.forEach((l) => l(newSettings));
}
