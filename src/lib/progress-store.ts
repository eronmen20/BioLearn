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

      // FIX: correct/total was previously accumulated across attempts, which made pct
      // exceed 100% when same quiz retaken. Now we take the BEST attempt's contribution:
      //   - totalQuestions contributed by best score
      //   - correct = score/100 * totalQuestions (rounded) of best attempt
      // This ensures pct = best accuracy, not summed-up.
      const bestCorrect = Math.round((Math.max(score, p.subs[subKey]?.score ?? 0) / 100) * totalQuestions);
      const newProgress = {
        ...state.progress,
        [babId]: {
          ...p,
          // total accumulates questions attempted in this bab across unique sub-babs
          total: p.total,
          correct: p.correct,
          subs: newSubs,
          completion_pct: completionPct,
        },
      };

      // Recompute total/correct from the actual sub-bab state (no double-count)
      // Each sub-bab contributes its BEST attempt's score×questions to the bab total.
      let babTotal = 0;
      let babCorrect = 0;
      for (const sk of Object.keys(newSubs)) {
        const sub = newSubs[sk];
        babCorrect += sub.score; // accumulate best score per sub (each sub ≤ 100)
        babTotal += 100;          // each sub worth 100% of its quiz
      }
      if (p.reflection_done) {
        babCorrect += p.reflection_score;
        babTotal += 100;
      }
      newProgress[babId].correct = babCorrect;
      newProgress[babId].total = babTotal;
      // quizzes = unique quizzes taken (each sub-bab once + reflection once), not attempts
      newProgress[babId].quizzes = Object.keys(newSubs).length + (p.reflection_done ? 1 : 0);

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
        // total/correct will be recomputed from subs state below
        total: p.total,
        correct: p.correct,
      };

      // Recalculate completion
      const totalSubs = Object.keys(newP.subs).length;
      const doneSubs = Object.values(newP.subs).filter((s) => s.done).length;
      const reflectionPct = newP.reflection_done ? 1 : 0;
      newP.completion_pct = totalSubs + 1 > 0 ? Math.round(((doneSubs + reflectionPct) / (totalSubs + 1)) * 100) : 0;

      // Recompute correct/total from subs (best score per sub + reflection if done)
      let babTotal = 0;
      let babCorrect = 0;
      for (const sk of Object.keys(newP.subs)) {
        const sub = newP.subs[sk];
        babCorrect += sub.score;
        babTotal += 100;
      }
      if (newP.reflection_done) {
        babCorrect += newP.reflection_score;
        babTotal += 100;
      }
      newP.correct = babCorrect;
      newP.total = babTotal;
      // quizzes = unique quizzes taken (each sub-bab once + reflection once), not attempts
      newP.quizzes = Object.keys(newP.subs).length + (newP.reflection_done ? 1 : 0);

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
    if (totalQs <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((totalCorrect / totalQs) * 100)));
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
    const rawProgress = data.progress || {};
    const sanitized: Record<string, BabProgress> = {};
    for (const [babId, p] of Object.entries(rawProgress) as [string, any][]) {
      const subs = p?.subs || {};
      const sanitizedSubs: Record<string, SubProgress> = {};
      // Recompute correct/total/quizzes from the actual sub-bab state, not the
      // stale accumulated values that old versions of the app wrote to the DB.
      let babTotal = 0;
      let babCorrect = 0;
      for (const [sk, s] of Object.entries(subs) as [string, any][]) {
        const score = Math.max(0, Math.min(100, Number(s?.score) || 0));
        sanitizedSubs[sk] = {
          done: !!s?.done,
          score,
          attempts: Math.max(0, Number(s?.attempts) || 0),
        };
        babTotal += 100; // each sub quiz worth up to 100
        babCorrect += score;
      }
      const reflection_done = !!p?.reflection_done;
      const reflection_score = Math.max(0, Math.min(100, Number(p?.reflection_score) || 0));
      if (reflection_done) {
        babTotal += 100;
        babCorrect += reflection_score;
      }
      sanitized[babId] = {
        quizzes: Object.keys(sanitizedSubs).length + (reflection_done ? 1 : 0),
        correct: babCorrect,
        total: babTotal,
        subs: sanitizedSubs,
        reflection_done,
        reflection_score,
        completion_pct: Math.max(0, Math.min(100, Number(p?.completion_pct) || 0)),
      };
    }
    useProgressStore.setState({
      progress: sanitized,
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
