import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - Public list praktikum (only 'published').
//   ?bab_id (required)
//   ?sub_bab_key (optional) — return rows whose sub_bab_key matches OR is NULL (fallback)
export async function GET(req: NextRequest) {
  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const babId = searchParams.get("bab_id");
    const subBabKey = searchParams.get("sub_bab_key");

    if (!babId) {
      return NextResponse.json({ error: "bab_id required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("praktikum")
      .select("id, bab_id, sub_bab_key, title_id, title_en, description_id, description_en, image_url, image_alt, steps, flashcards, difficulty")
      .eq("bab_id", babId)
      .eq("status", "published")
      .order("id", { ascending: true });

    if (error) throw error;

    let rows = data || [];
    if (subBabKey) {
      rows = rows.filter((r) => r.sub_bab_key === subBabKey || r.sub_bab_key === null || r.sub_bab_key === "");
    }

    return NextResponse.json({ praktikum: rows });
  } catch (e) {
    console.error("[API Praktikum GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
