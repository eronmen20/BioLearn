import { NextRequest, NextResponse } from "next/server";
import { getPublicDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Public endpoint for fetching quiz questions per sub-bab
// Query params:
//   bab_id       — filter by bab
//   sub_bab_key  — "is_reflection" for reflection quiz of a bab, or specific sub-bab key
// Returns: { quiz: QuizV2Question[] }
export async function GET(req: NextRequest) {
  try {
    const supabase = getPublicDb();
    const { searchParams } = new URL(req.url);
    const babId = searchParams.get("bab_id");
    const subBabKey = searchParams.get("sub_bab_key");

    if (!babId) {
      return NextResponse.json({ error: "bab_id wajib diisi" }, { status: 400 });
    }

    let query = supabase
      .from("sub_bab_quiz")
      .select("*")
      .eq("bab_id", babId)
      .order("sort_order", { ascending: true });

    if (subBabKey === "is_reflection") {
      query = query.eq("is_reflection", true);
    } else if (subBabKey) {
      query = query.eq("sub_bab_key", subBabKey);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ quiz: data || [] });
  } catch (e) {
    console.error("[API Quiz Public GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}