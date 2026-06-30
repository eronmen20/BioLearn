"use client";

import { create } from "zustand";
import { useEffect } from "react";

export interface BabProgress {
  quizzes: number;
  correct: number;
  total: number;
  subs: Record<string, { done: boolean }>;
}

interface ProgressState {
  progress: Record<string, BabProgress>;
  _hydrated: boolean;
  getProgress: (babId: string) => BabProgress;
  recordAnswer: (babId: string, subKey: string, correct: boolean) => void;
  getMastery: () => number;
  getTotalQuizzes: () => number;
  getTotalCorrect: () => number;
}

function getCurrentEmail(): string {
  try {
    const raw = localStorage.getItem("biolearn-auth");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed?.user?.email || "";
  } catch {
    return "";
  }
}

const defaultProgress = (): BabProgress => ({
  quizzes: 0,
  correct: 0,
  total: 0,
  subs: {},
});

export const useProgressStore = create<ProgressState>()((set, get) => ({
  progress: {},
  _hydrated: false,

  getProgress: (babId) => {
    return get().progress[babId] || defaultProgress();
  },

  recordAnswer: async (babId, subKey, correct) => {
    const email = getCurrentEmail();
    if (!email) return;

    set((state) => {
      const p = { ...(state.progress[babId] || defaultProgress()) };
      const newTotal = p.total + 1;
      const newCorrect = p.correct + (correct ? 1 : 0);
      const subDone = newTotal > 0 && newCorrect / newTotal >= 0.5;

      const newProgress = {
        ...state.progress,
        [babId]: {
          ...p,
          total: newTotal,
          correct: newCorrect,
          quizzes: Math.ceil(newTotal / 4),
          subs: {
            ...p.subs,
            [subKey]: { done: subDone },
          },
        },
      };

      // Save to API (fire and forget)
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          babId,
          data: newProgress[babId],
        }),
      }).catch(() => {});

      return { progress: newProgress };
    });
  },

  getMastery: () => {
    const { progress } = get();
    let totalCorrect = 0;
    let totalQs = 0;
    Object.values(progress).forEach((p) => {
      totalCorrect += p.correct;
      totalQs += p.total;
    });
    return totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 0;
  },

  getTotalQuizzes: () => {
    return Object.values(get().progress).reduce((s, p) => s + p.quizzes, 0);
  },

  getTotalCorrect: () => {
    return Object.values(get().progress).reduce((s, p) => s + p.correct, 0);
  },
}));

// Load progress from API based on current user
export async function loadUserProgress(email: string) {
  if (!email) {
    useProgressStore.setState({ progress: {}, _hydrated: true });
    return;
  }

  try {
    const res = await fetch(`/api/progress?email=${encodeURIComponent(email)}`);
    const data = await res.json();
    useProgressStore.setState({
      progress: data.progress || {},
      _hydrated: true,
    });
  } catch (e) {
    console.warn("[BioLearn] Failed to load progress from API:", e);
    useProgressStore.setState({ progress: {}, _hydrated: true });
  }
}

// Reset progress
export function resetProgress() {
  useProgressStore.setState({ progress: {}, _hydrated: true });
}

// Hydrate from localStorage AFTER mount based on current user
export function useProgressHydration() {
  useEffect(() => {
    const email = getCurrentEmail();
    loadUserProgress(email);
  }, []);
}

// Hook: returns true when store is fully hydrated
export function useProgressReady() {
  return useProgressStore((s) => s._hydrated);
}
