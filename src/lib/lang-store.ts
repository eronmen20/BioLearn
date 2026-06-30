"use client";

import { create } from "zustand";

export type Lang = "id" | "en";

interface LangState {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

// Minimal EN/ID translations (full dict loaded from i18n.ts)
// These are fallbacks only — the full translations are loaded via the imported maps
import { EN, ID } from "./i18n";

export const useLangStore = create<LangState>()((set, get) => ({
  lang: "id",
  setLang: (l) => set({ lang: l }),
  t: (key) => {
    const { lang } = get();
    const dict = lang === "en" ? EN : ID;
    return (dict as Record<string, string>)[key] || key;
  },
}));