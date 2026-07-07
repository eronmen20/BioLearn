import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - Public list struktur for user-facing pages
// Query params:
//   bab_id (required)
//   sub_bab_key (optional) — if provided, only returns struktur whose
//                           sub_bab_key matches this value OR is null
//                           (fallback = apply to all sub-babs in this bab)
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
      .from("struktur_fungsi")
      .select("id, bab_id, sub_bab_key, title, title_en, image_url, image_alt, flashcards, sort_order")
      .eq("bab_id", babId)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    let rows = data || [];

    // If a sub_bab_key filter is requested:
    //   - Include rows whose sub_bab_key exactly matches
    //   - ALSO include rows whose sub_bab_key IS NULL (these are
    //     "applies to all sub-babs" fallbacks)
    if (subBabKey) {
      rows = rows.filter((r) => r.sub_bab_key === subBabKey || r.sub_bab_key === null || r.sub_bab_key === "");
    }

    return NextResponse.json({ struktur: rows });
  } catch (e) {
    console.error("[API Struktur GET]", e);
    const msg = e instanceof Error ? e.message : typeof e === "object" && e !== null ? JSON.stringify(e) : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
