"use client";

import { create } from "zustand";
import { useEffect } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  resolved: "light" | "dark"; // actual theme after resolving system
  setTheme: (t: Theme) => void;
}

const STORAGE_KEY = "biolearn-theme";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") return getSystemTheme();
  return theme;
}

function applyTheme(resolved: "light" | "dark") {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", resolved);
}

export const useThemeStore = create<ThemeState>()((set) => ({
  theme: "light",
  resolved: "light",

  setTheme: (t: Theme) => {
    const resolved = resolveTheme(t);
    applyTheme(resolved);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, t);
    }
    set({ theme: t, resolved });
  },
}));

// Hydrate from localStorage AFTER mount
export function useThemeHydration() {
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const theme = stored || "light";
    const resolved = resolveTheme(theme);
    applyTheme(resolved);
    useThemeStore.setState({ theme, resolved });

    // Listen for system theme changes
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const current = useThemeStore.getState().theme;
      if (current === "system") {
        const newResolved = getSystemTheme();
        applyTheme(newResolved);
        useThemeStore.setState({ resolved: newResolved });
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
}
