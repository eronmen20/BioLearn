import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - Public list of bab
//   ?include_archived=true → user-facing (hidden by default, only active bak)
//   ?include_archived=false / off → public landing page (active only)
//   ?include_archived=true → when admin wants to see all from sidebar/dashboard hybrid
export async function GET(req: NextRequest) {
  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get("include_archived") === "true";

    let query = supabase
      .from("bab")
      .select("id, icon, color, video_id, video_title_id, video_title_en, hotspotted, kelas_id, is_archived, archived_at, created_at")
      .order("created_at", { ascending: true });

    if (!includeArchived) {
      query = query.eq("is_archived", false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ bab: data || [] });
  } catch (e) {
    console.error("[API Bab GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
