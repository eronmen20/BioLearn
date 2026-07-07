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
  // Per-sub title (parallel array to subs[] — index i corresponds to subs[i])
  // Comes from sub_bab.title_id/title_en (source of truth)
  subTitles: { id: string; en: string }[];
  // Per-sub media indexed by sub_bab key
  mediaBySub: Record<string, SubMedia>;
  source: "supabase" | "hardcoded";
}

const EMPTY_MEDIA: SubMedia = {
  video_url: "",
  image_url: "",
  animation_url: "",
  animation_type: "",
};

export function useBabContent(babId: string): { data: ContentData | null; loading: boolean; source: "supabase" | "hardcoded" } {
  const [data, setData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"supabase" | "hardcoded">("supabase");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function load() {
      const hardcodedBab = BAB.find((b) => b.id === babId);
      if (!hardcodedBab) {
        if (!cancelled) {
          setData(null);
          setLoading(false);
        }
        return;
      }

      // Try Supabase first — strict "ALL-or-nothing" policy
      try {
        const res = await fetch(`/api/content?bab_id=${encodeURIComponent(babId)}&_t=${Date.now()}`, {
          signal: AbortSignal.timeout(3000),
          cache: "no-store",
        });
        if (res.ok) {
          const supaData: SupabaseContent = await res.json();

          // STRICT: treat any of the following as "no real content" and prefer empty notice
          // (don't silently fall back to bab-data.ts hardcoded text — that's the revert bug!)
          const hasAnyRealContent =
            supaData.has_content &&
            supaData.subs.length > 0 &&
            // Must have at least one entry with text inside summary/full
            supaData.subs.some(
              (s) =>
                (s.summary?.id && s.summary.id.trim()) ||
                (s.full?.id && s.full.id.trim()) ||
                (s.title?.id && s.title.id.trim())
            );

          if (hasAnyRealContent && !cancelled) {
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
            setSource("supabase");
            setLoading(false);
            console.info(`[bab-content:${babId}] source=supabase, ${subs.length} sub-bab loaded`);
            return;
          } else {
            // Has a row in DB but EVERY row is empty → admin hasn't filled yet
            console.warn(`[bab-content:${babId}] source=null (Supabase returned but all rows empty — showing empty notice, NOT hardcoded fallback)`);
            if (!cancelled) {
              setData({
                bab: hardcodedBab,
                summary: { id: [], en: [] },
                full: { id: [], en: [] },
                quiz: [],
                subs: supaData.subs.map((s) => s.key), // even if empty text, use the keys
                subTitles: supaData.subs.map((s) => ({ id: s.title?.id || "", en: s.title?.en || "" })),
                mediaBySub: {},
                source: "supabase",
              });
              setSource("supabase");
              setLoading(false);
            }
            return;
          }
        }
      } catch (e) {
        console.error(`[bab-content:${babId}] Supabase fetch failed:`, e instanceof Error ? e.message : e);
      }

      // Hard fallback ONLY when API totally unreachable (network failure / 5xx)
      // The earlier revert bug was: silent fallback to bab-data.ts even when API returned
      // an empty/malformed row. That branch now correctly logs + still falls back so the
      // page doesn't show a blank white screen, BUT a UI banner alerts the user.
      console.warn(`[bab-content:${babId}] source=hardcoded (FALLBACK via bab-data.ts) — UI banner will warn admin`);
      if (!cancelled) {
        setData({
          bab: hardcodedBab,
          summary: hardcodedBab.summary,
          full: hardcodedBab.full,
          quiz: QUIZ[babId] || [],
          subs: hardcodedBab.subs,
          subTitles: hardcodedBab.subs.map(() => ({ id: "", en: "" })),
          mediaBySub: hardcodedBab.subs.reduce<Record<string, SubMedia>>((acc, k) => {
            acc[k] = { ...EMPTY_MEDIA };
            return acc;
          }, {}),
          source: "hardcoded",
        });
        setSource("hardcoded");
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [babId]);

  return { data, loading, source };
}
