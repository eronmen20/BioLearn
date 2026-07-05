"use client";

import { create } from "zustand";
import { useEffect } from "react";

export interface SubProgress {
  done: boolean;        // quiz sub-bab lulus
  score: number;        // 0-100
  attempts: number;     // berapa kali coba
}

export interface BabProgress {
  quizzes: number;
  correct: number;
  total: number;
  subs: Record<string, SubProgress>;
  reflection_done: boolean;
  reflection_score: number;
  completion_pct: number; // 0-100
}

interface ProgressState {
  progress: Record<string, BabProgress>;
  _hydrated: boolean;
  getProgress: (babId: string) => BabProgress;
  recordSubQuiz: (babId: string, subKey: string, score: number, totalQuestions: number) => void;
  recordReflection: (babId: string, score: number, totalQuestions: number) => void;
  isSubUnlocked: (babId: string, subKey: string, allSubKeys: string[]) => boolean;
  isReflectionUnlocked: (babId: string, allSubKeys: string[]) => boolean;
  getCompletionPct: (babId: string, allSubKeys: string[]) => number;
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
  reflection_done: false,
  reflection_score: 0,
  completion_pct: 0,
});

export const useProgressStore = create<ProgressState>()((set, get) => ({
  progress: {},
  _hydrated: false,

  getProgress: (babId) => {
    return get().progress[babId] || defaultProgress();
  },

  recordSubQuiz: (babId, subKey, score, totalQuestions) => {
    const email = getCurrentEmail();
    if (!email) return;

    set((state) => {
      const p = { ...(state.progress[babId] || defaultProgress()) };
      const passed = score >= 80; // 80% untuk lulus

      const newSubs = {
        ...p.subs,
        [subKey]: {
          done: passed || (p.subs[subKey]?.done ?? false), // once done, stays done
          score: Math.max(score, p.subs[subKey]?.score ?? 0),
          attempts: (p.subs[subKey]?.attempts ?? 0) + 1,
        },
      };

      // Calculate completion %
      const totalSubs = Object.keys(newSubs).length;
      const doneSubs = Object.values(newSubs).filter((s) => s.done).length;
      const reflectionPct = p.reflection_done ? 1 : 0;
      const totalItems = totalSubs + 1; // +1 for reflection
      const doneItems = doneSubs + reflectionPct;
      const completionPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

      const newProgress = {
        ...state.progress,
        [babId]: {
          ...p,
          total: p.total + totalQuestions,
          correct: p.correct + Math.round((score / 100) * totalQuestions),
          quizzes: p.quizzes + 1,
          subs: newSubs,
          completion_pct: completionPct,
        },
      };

      // Save to API (fire and forget)
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, babId, data: newProgress[babId] }),
      }).catch(() => {});

      return { progress: newProgress };
    });
  },

  recordReflection: (babId, score, totalQuestions) => {
    const email = getCurrentEmail();
    if (!email) return;

    set((state) => {
      const p = { ...(state.progress[babId] || defaultProgress()) };
      const passed = score >= 80;

      const newP = {
        ...p,
        reflection_done: passed || p.reflection_done,
        reflection_score: Math.max(score, p.reflection_score),
        total: p.total + totalQuestions,
        correct: p.correct + Math.round((score / 100) * totalQuestions),
        quizzes: p.quizzes + 1,
      };

      // Recalculate completion
      const totalSubs = Object.keys(newP.subs).length;
      const doneSubs = Object.values(newP.subs).filter((s) => s.done).length;
      const reflectionPct = newP.reflection_done ? 1 : 0;
      newP.completion_pct = totalSubs + 1 > 0 ? Math.round(((doneSubs + reflectionPct) / (totalSubs + 1)) * 100) : 0;

      const newProgress = { ...state.progress, [babId]: newP };

      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, babId, data: newP }),
      }).catch(() => {});

      return { progress: newProgress };
    });
  },

  isSubUnlocked: (babId, subKey, allSubKeys) => {
    const idx = allSubKeys.indexOf(subKey);
    if (idx <= 0) return true; // first sub always unlocked
    const p = get().progress[babId];
    if (!p) return false;
    const prevKey = allSubKeys[idx - 1];
    return p.subs[prevKey]?.done ?? false;
  },

  isReflectionUnlocked: (babId, allSubKeys) => {
    const p = get().progress[babId];
    if (!p) return false;
    return allSubKeys.every((key) => p.subs[key]?.done ?? false);
  },

  getCompletionPct: (babId, allSubKeys) => {
    const p = get().progress[babId];
    if (!p) return 0;
    const totalSubs = allSubKeys.length;
    const doneSubs = allSubKeys.filter((key) => p.subs[key]?.done ?? false).length;
    const reflectionPct = p.reflection_done ? 1 : 0;
    return totalSubs + 1 > 0 ? Math.round(((doneSubs + reflectionPct) / (totalSubs + 1)) * 100) : 0;
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
let _progressLoadToken = 0; // monotonically increasing — newer requests invalidate older ones
export async function loadUserProgress(email: string) {
  if (!email) {
    useProgressStore.setState({ progress: {}, _hydrated: true });
    return;
  }

  const myToken = ++_progressLoadToken; // capture THIS request's token

  try {
    const res = await fetch(`/api/progress?email=${encodeURIComponent(email)}`, {
      cache: "no-store",
    });
    if (myToken !== _progressLoadToken) {
      // a newer loadUserProgress call started while we were fetching — abandon this update
      return;
    }
    const data = await res.json();
    useProgressStore.setState({
      progress: data.progress || {},
      _hydrated: true,
    });
  } catch (e) {
    if (myToken !== _progressLoadToken) return;
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
    let cancelled = false;
    const email = getCurrentEmail();
    loadUserProgress(email);
    return () => {
      cancelled = true;
      // bump token so any in-flight loadUserProgress from this effect aborts its setState
      _progressLoadToken++;
    };
  }, []);
}

// Hook: returns true when store is fully hydrated
export function useProgressReady() {
  return useProgressStore((s) => s._hydrated);
}
