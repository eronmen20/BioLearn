import { NextRequest, NextResponse } from "next/server";
import { getPublicDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - List sub_bab, optionally filtered by bab_id
export async function GET(req: NextRequest) {
  try {
    const supabase = getPublicDb();
    const { searchParams } = new URL(req.url);
    const babId = searchParams.get("bab_id");

    let query = supabase
      .from("sub_bab")
      .select("id, bab_id, key, title_id, title_en, sort_order")
      .order("sort_order", { ascending: true });

    if (babId) query = query.eq("bab_id", babId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ subBab: data || [] });
  } catch (e) {
    console.error("[API SubBab GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
