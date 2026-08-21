"use client";

import { create } from "zustand";
import { useEffect } from "react";
import { loadUserProgress, resetProgress } from "./progress-store";

export interface User {
  email: string;
  name: string;
  role: "user" | "admin";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hydrated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
}

const STORAGE_KEY = "biolearn-auth";

function loadFromStorage(): { user: User | null; isAuthenticated: boolean } {
  if (typeof window === "undefined") return { user: null, isAuthenticated: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, isAuthenticated: false };
    return JSON.parse(raw);
  } catch {
    return { user: null, isAuthenticated: false };
  }
}

function saveToStorage(user: User | null, isAuthenticated: boolean) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, isAuthenticated }));
  } catch {
    // ignore
  }
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  _hydrated: false,

  login: async (email, password) => {
    set({ isLoading: true });

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({ isLoading: false });
        return { success: false, error: data.error || "Login gagal", needsVerification: data.needsVerification };
      }

      const user: User = data.user;
      saveToStorage(user, true);
      set({ user, isAuthenticated: true, isLoading: false });

      loadUserProgress(user.email);

      return { success: true };
    } catch (e) {
      set({ isLoading: false });
      return { success: false, error: "Gagal terhubung ke server" };
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    saveToStorage(null, false);
    set({ user: null, isAuthenticated: false });
    resetProgress();
  },

  register: async (email, password, name) => {
    set({ isLoading: true });

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({ isLoading: false });
        return { success: false, error: data.error || "Register gagal" };
      }

      set({ isLoading: false });
      return { success: true, needsVerification: data.needsVerification };
    } catch (e) {
      set({ isLoading: false });
      return { success: false, error: "Gagal terhubung ke server" };
    }
  },
}));

export function useAuthHydration() {
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored.user) {
      useAuthStore.setState({ ...stored, _hydrated: true });
      loadUserProgress(stored.user.email);
    } else {
      useAuthStore.setState({ _hydrated: true });
    }
  }, []);
}
