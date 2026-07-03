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
  type: string;
}

interface SupabaseContent {
  bab_id: string;
  subs: SupabaseSub[];
  quiz: QuizQuestion[];
  has_content: boolean;
}

interface ContentData {
  bab: BabSub;
  summary: { id: string[]; en: string[] };
  full: { id: string[]; en: string[] };
  quiz: QuizQuestion[];
  subs: string[];
  source: "supabase" | "hardcoded";
}

export function useBabContent(babId: string): { data: ContentData | null; loading: boolean } {
  const [data, setData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);

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

      // Try Supabase first
      try {
        const res = await fetch(`/api/content?bab_id=${babId}`, {
          signal: AbortSignal.timeout(3000), // 3s timeout
        });
        if (res.ok) {
          const supaData: SupabaseContent = await res.json();

          if (supaData.has_content && supaData.subs.length > 0 && !cancelled) {
            const summaryId = supaData.subs.map((s) => s.summary.id);
            const summaryEn = supaData.subs.map((s) => s.summary.en);
            const fullId = supaData.subs.map((s) => s.full.id);
            const fullEn = supaData.subs.map((s) => s.full.en);
            const subs = supaData.subs.map((s) => s.key);

            setData({
              bab: hardcodedBab,
              summary: { id: summaryId, en: summaryEn },
              full: { id: fullId, en: fullEn },
              quiz: supaData.quiz.length > 0 ? supaData.quiz : (QUIZ[babId] || []),
              subs,
              source: "supabase",
            });
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fall through to hardcoded
      }

      // Fallback to hardcoded data
      if (!cancelled) {
        setData({
          bab: hardcodedBab,
          summary: hardcodedBab.summary,
          full: hardcodedBab.full,
          quiz: QUIZ[babId] || [],
          subs: hardcodedBab.subs,
          source: "hardcoded",
        });
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [babId]);

  return { data, loading };
}
