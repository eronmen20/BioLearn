import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    // Get quiz for this bab
    const { data: quiz, error: quizError } = await supabase
      .from("quiz")
      .select("*")
      .eq("bab_id", babId)
      .order("sort_order", { ascending: true });

    if (quizError) throw quizError;

    // Transform materi to match expected format
    const subs = (materi || []).map((m) => {
      const meta = (m.metadata as Record<string, unknown>) || {};
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
        video_url: (meta.video_url as string) || "",
        type: m.type,
      };
    });

    // Transform quiz to match expected format
    const quizData = (quiz || []).map((q) => ({
      q: {
        id: q.question_id,
        en: q.question_en,
      },
      opts: {
        id: q.options_id,
        en: q.options_en,
      },
      ans: q.correct_answer,
      explanation: {
        id: q.explanation_id || "",
        en: q.explanation_en || "",
      },
    }));

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
