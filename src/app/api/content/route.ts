import { NextRequest, NextResponse } from "next/server";
import { getPublicDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Get full bab content for user-facing pages
//
// Source of truth priority:
//   1. sub_bab table — defines sub-bab list, titles, media
//   2. materi table — enriches sub-bab with content (full/summary)
//   3. materi table — orphan entries (no matching sub_bab) still included
//      as legacy fallback (content + media only, no sub_bab metadata)
//
// Sub-bab list shape returned in `subs` is driven by sub_bab table.
// sub_bab_key in subs[i].key comes from sub_bab.key directly — NOT from materi.
// Title comes from sub_bab.title_id/title_en — NOT from materi.metadata.
export async function GET(req: NextRequest) {
  try {
    const supabase = getPublicDb();
    const { searchParams } = new URL(req.url);
    const babId = searchParams.get("bab_id");

    if (!babId) {
      return NextResponse.json({ error: "bab_id required" }, { status: 400 });
    }

    // Get all sub_bab for this bab (source of truth for sub-bab list)
    const { data: babRow, error: babError } = await supabase
      .from("bab")
      .select("is_archived, archived_at")
      .eq("id", babId)
      .maybeSingle();

    if (babError) throw babError;

    // Get all sub_bab for this bab (source of truth for sub-bab list)
    const { data: subBabRows, error: subBabError } = await supabase
      .from("sub_bab")
      .select("*")
      .eq("bab_id", babId)
      .order("sort_order", { ascending: true });

    if (subBabError) throw subBabError;

    // Get materi rows (content enrichment)
    const { data: materi, error: materiError } = await supabase
      .from("materi")
      .select("*")
      .eq("bab_id", babId)
      .order("sort_order", { ascending: true });

    if (materiError) throw materiError;

    // Get legacy quiz for this bab (backward compat — tabel quiz lama)
    const { data: quiz, error: quizError } = await supabase
      .from("quiz")
      .select("*")
      .eq("bab_id", babId)
      .order("sort_order", { ascending: true });

    if (quizError) throw quizError;

    // Get sub_bab_quiz (v2) — quiz per sub-bab, sumber utama quiz baru.
    const { data: subBabQuiz, error: subBabQuizError } = await supabase
      .from("sub_bab_quiz")
      .select("*")
      .eq("bab_id", babId)
      .order("sort_order", { ascending: true });

    if (subBabQuizError) throw subBabQuizError;

    // Index materi by sub_bab_key for O(1) lookup
    type MateriRow = {
      id: number;
      bab_id: string;
      sub_bab_key: string | null;
      type: string | null;
      content_id: string | null;
      content_en: string | null;
      summary_id: string | null;
      summary_en: string | null;
      metadata: unknown;
    };
    const materiByKey = new Map<string, MateriRow>();
    for (const m of materi || []) {
      const k = (m.sub_bab_key as string | null) || "";
      if (k) materiByKey.set(k, m as MateriRow);
    }

    // Build subs array from sub_bab rows (source of truth)
    const subs: Array<{
      key: string;
      title: { id: string; en: string };
      summary: { id: string; en: string };
      full: { id: string; en: string };
      video_url: string;
      image_url: string;
      animation_url: string;
      animation_type: string;
      type: string;
    }> = [];

    for (const sb of subBabRows || []) {
      const key = (sb.key as string) || "";
      if (!key) continue;

      const materiRow = materiByKey.get(key);
      const meta = (materiRow?.metadata as Record<string, unknown>) || {};

      // Title: sub_bab is source of truth, fallback to materi.metadata for legacy
      const titleId =
        (sb.title_id as string) || (meta.title_id as string) || "";
      const titleEn =
        (sb.title_en as string) || (meta.title_en as string) || "";

      // Summary: prefer materi.summary_id/en, fallback to sub_bab.summary_id/en
      const summaryId =
        materiRow?.summary_id || (sb.summary_id as string) || "";
      const summaryEn =
        materiRow?.summary_en || (sb.summary_en as string) || "";

      // Full content: only materi has it
      const fullId = materiRow?.content_id || "";
      const fullEn = materiRow?.content_en || "";

      subs.push({
        key,
        title: { id: titleId, en: titleEn },
        summary: { id: summaryId, en: summaryEn },
        full: { id: fullId, en: fullEn },
        video_url: (sb.video_url as string) || "",
        image_url: (sb.image_url as string) || "",
        animation_url: (sb.animation_url as string) || "",
        animation_type: (sb.animation_type as string) || "",
        type: materiRow?.type || "text",
      });

      // Mark this key as processed
      materiByKey.delete(key);
    }

    // Add orphan materi entries (materi rows without matching sub_bab)
    // These come from legacy data or admin imports. Use materi.sub_bab_key as key.
    for (const m of Array.from(materiByKey.values())) {
      const key = (m.sub_bab_key as string) || "";
      if (!key) continue;
      const meta = (m.metadata as Record<string, unknown>) || {};

      subs.push({
        key,
        title: {
          id: (meta.title_id as string) || "",
          en: (meta.title_en as string) || "",
        },
        summary: {
          id: m.summary_id || "",
          en: m.summary_en || "",
        },
        full: {
          id: m.content_id || "",
          en: m.content_en || "",
        },
        video_url: (meta.video_url as string) || "",
        image_url: (meta.image_url as string) || "",
        animation_url: (meta.animation_url as string) || "",
        animation_type: (meta.animation_type as string) || "",
        type: m.type || "text",
      });
    }

    // Transform quiz to match expected format
    const quizData = [
      ...((quiz || []).map((q) => ({
        q: {
          id: q.question_id,
          en: q.question_en,
        },
        opts: {
          id: q.options_id,
          en: q.options_en,
        },
        ans: q.correct_answer,
        sub_bab_key: null,
        explanation: {
          id: q.explanation_id || "",
          en: q.explanation_en || "",
        },
      }))),
      ...((subBabQuiz || []).map((q) => ({
        q: {
          id: q.question_id,
          en: q.question_en,
        },
        opts: {
          id: q.options_id,
          en: q.options_en,
        },
        ans: q.correct_answer,
        sub_bab_key: q.sub_bab_key,
        is_reflection: q.is_reflection || false,
        explanation: {
          id: q.explanation_id || "",
          en: q.explanation_en || "",
        },
      }))),
    ];

    return NextResponse.json(
      {
        bab_id: babId,
        is_archived: babRow?.is_archived || false,
        archived_at: babRow?.archived_at || null,
        subs,
        quiz: quizData,
        has_content: subs.length > 0,
      },
      {
        // Kill CDN/browser cache so admin edits show immediately on refresh
        // (previously: Vercel CDN cached for 60s default → had to refresh 2x)
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (e) {
    console.error("[API Bab Content GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}