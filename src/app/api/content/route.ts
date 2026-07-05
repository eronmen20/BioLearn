import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - Get full bab content for user-facing pages
export async function GET(req: NextRequest) {
  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const babId = searchParams.get("bab_id");

    if (!babId) {
      return NextResponse.json({ error: "bab_id required" }, { status: 400 });
    }

    // Get materi for this bab
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
    // Di-fetch di sini supaya endpoint /api/content tetap backward-compatible
    // dengan hook useBabContent yang membaca content.quiz.
    const { data: subBabQuiz, error: subBabQuizError } = await supabase
      .from("sub_bab_quiz")
      .select("*")
      .eq("bab_id", babId)
      .order("sort_order", { ascending: true });

    if (subBabQuizError) throw subBabQuizError;

    // Get sub_bab for this bab (to source video_url/image_url/animation_url/animation_type)
    const { data: subBabRows } = await supabase
      .from("sub_bab")
      .select("key, video_url, image_url, animation_url, animation_type")
      .eq("bab_id", babId);

    // Index sub_bab media by key for O(1) lookup
    const subBabMediaByKey: Record<string, {
      video_url: string;
      image_url: string;
      animation_url: string;
      animation_type: string;
    }> = {};
    for (const sb of subBabRows || []) {
      const k = (sb.key as string) || "";
      if (k) {
        subBabMediaByKey[k] = {
          video_url: (sb.video_url as string) || "",
          image_url: (sb.image_url as string) || "",
          animation_url: (sb.animation_url as string) || "",
          animation_type: (sb.animation_type as string) || "",
        };
      }
    }

    // Transform materi to match expected format.
    // Media resolution: sub_bab (source of truth) → materi.metadata (legacy fallback).
    const subs = (materi || []).map((m) => {
      const meta = (m.metadata as Record<string, unknown>) || {};
      const sbMedia = subBabMediaByKey[m.sub_bab_key as string] || {
        video_url: "",
        image_url: "",
        animation_url: "",
        animation_type: "",
      };
      return {
        key: m.sub_bab_key,
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
        video_url: sbMedia.video_url || (meta.video_url as string) || "",
        image_url: sbMedia.image_url || (meta.image_url as string) || "",
        animation_url: sbMedia.animation_url || (meta.animation_url as string) || "",
        animation_type: sbMedia.animation_type || (meta.animation_type as string) || "",
        type: m.type,
      };
    });

    // Also synthesize entries for sub_bab rows that have NO matching materi row
    // (so direct sub_bab media shows up even if materi was never created)
    const materiKeys = new Set((materi || []).map((m) => m.sub_bab_key));
    for (const [key, media] of Object.entries(subBabMediaByKey)) {
      if (materiKeys.has(key)) continue;
      const hasAnyMedia = media.video_url || media.image_url || media.animation_url;
      if (!hasAnyMedia) continue;
      subs.push({
        key,
        title: { id: "", en: "" },
        summary: { id: "", en: "" },
        full: { id: "", en: "" },
        video_url: media.video_url,
        image_url: media.image_url,
        animation_url: media.animation_url,
        animation_type: media.animation_type,
        type: "media",
      });
    }

    // Transform quiz to match expected format (legacy quiz format)
// Include BOTH legacy quiz + new sub_bab_quiz (v2) so user-facing views
// dapat quiz dari kedua sumber. sub_bab_quiz biasanya punya sub_bab_key,
// legacy quiz tidak — keduanya dipake di view berbeda.
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
        sub_bab_key: null, // legacy quiz ga punya sub_bab_key
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

    return NextResponse.json({
      bab_id: babId,
      subs,
      quiz: quizData,
      has_content: subs.length > 0,
    });
  } catch (e) {
    console.error("[API Bab Content GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
