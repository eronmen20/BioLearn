"use client";

import { useState, useEffect } from "react";
import { BAB, type BabSub } from "@/lib/bab-data";
import { QUIZ, type QuizQuestion } from "@/lib/quiz-data";

interface SupabaseSub {
  key: string;
  title: { id: string; en: string };
  summary: { id: string; en: string };
  full: { id: string; en: string };
  video_url: string;
  image_url: string;
  animation_url: string;
  animation_type: string;
  type: string;
}

interface SupabaseContent {
  bab_id: string;
  subs: SupabaseSub[];
  quiz: QuizQuestion[];
  has_content: boolean;
}

interface SubMedia {
  video_url: string;
  image_url: string;
  animation_url: string;
  animation_type: string;
}

interface ContentData {
  bab: BabSub;
  summary: { id: string[]; en: string[] };
  full: { id: string[]; en: string[] };
  quiz: QuizQuestion[];
  subs: string[];
  subTitles: { id: string; en: string }[];
  mediaBySub: Record<string, SubMedia>;
  source: "supabase";
}

/** Helper: fetch with retry — handles Supabase cold-start where first request fails */
async function fetchWithRetry(url: string, maxRetries = 1, timeoutMs = 5000): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Fresh timestamp per attempt (busts any cached DNS/connection)
      const urlWithFreshTs = url.includes("_t=")
        ? url.replace(/_t=\d+/, `_t=${Date.now()}`)
        : `${url}&_t=${Date.now()}`;
      const res = await fetch(urlWithFreshTs, {
        signal: AbortSignal.timeout(timeoutMs),
        cache: "no-store",
      });
      return res;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < maxRetries) {
        // Small delay before retry (Supabase cold-start warmup)
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }
  throw lastError;
}

export function useBabContent(babId: string): { data: ContentData | null; loading: boolean; error: string | null } {
  const [data, setData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      const hardcodedBab = BAB.find((b) => b.id === babId);
      if (!hardcodedBab) {
        if (!cancelled) {
          setData(null);
          setLoading(false);
        }
        return;
      }

      // Try Supabase. On failure → show error state (no hardcoded fallback).
      try {
        const res = await fetchWithRetry(
          `/api/content?bab_id=${encodeURIComponent(babId)}&_t=${Date.now()}`,
          1,  // maxRetries
          5000  // timeoutMs
        );
        if (res.ok) {
          const supaData: SupabaseContent = await res.json();
          if (supaData.has_content && supaData.subs.length > 0 && !cancelled) {
            const summaryId = supaData.subs.map((s) => s.summary.id);
            const summaryEn = supaData.subs.map((s) => s.summary.en);
            const fullId = supaData.subs.map((s) => s.full.id);
            const fullEn = supaData.subs.map((s) => s.full.en);
            const subs = supaData.subs.map((s) => s.key);
            const subTitles = supaData.subs.map((s) => ({
              id: s.title?.id || "",
              en: s.title?.en || "",
            }));

            const mediaBySub: Record<string, SubMedia> = {};
            for (const s of supaData.subs) {
              mediaBySub[s.key] = {
                video_url: s.video_url || "",
                image_url: s.image_url || "",
                animation_url: s.animation_url || "",
                animation_type: s.animation_type || "",
              };
            }

            if (!cancelled) {
              setData({
                bab: hardcodedBab,
                summary: { id: summaryId, en: summaryEn },
                full: { id: fullId, en: fullEn },
                quiz: supaData.quiz.length > 0 ? supaData.quiz : (QUIZ[babId] || []),
                subs,
                subTitles,
                mediaBySub,
                source: "supabase",
              });
              setLoading(false);
            }
            return;
          }
        }
        // API returned but no valid content → treat as error
        if (!cancelled) {
          setError("Konten belum tersedia untuk bab ini.");
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Gagal menghubungi server";
          setError(msg);
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [babId]);

  return { data, loading, error };
}