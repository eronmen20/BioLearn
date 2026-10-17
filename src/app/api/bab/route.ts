import { NextRequest, NextResponse } from "next/server";
import { getPublicDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Public list of bab
//   ?include_archived=true → user-facing (hidden by default, only active bak)
//   ?include_archived=false / off → public landing page (active only)
//   ?include_archived=true → when admin wants to see all from sidebar/dashboard hybrid
export async function GET(req: NextRequest) {
  try {
    const supabase = getPublicDb();
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

    // Attach sub_bab keys per bab (same source as /api/content) so client-side
    // progress % uses the same keys as the bab view itself.
    const rows = data || [];
    const subKeysByBab: Record<string, string[]> = {};
    if (rows.length > 0) {
      const { data: subKeys, error: subKeysError } = await supabase
        .from("sub_bab")
        .select("bab_id, key, sort_order")
        .in("bab_id", rows.map((b) => b.id))
        .order("sort_order", { ascending: true });
      if (subKeysError) {
        console.error("[API Bab GET] sub_bab keys fetch failed:", subKeysError);
      } else {
        for (const row of subKeys || []) {
          const key = String(row.key || "");
          if (!key) continue;
          const babId = String(row.bab_id || "");
          if (!babId) continue;
          if (!subKeysByBab[babId]) subKeysByBab[babId] = [];
          subKeysByBab[babId].push(key);
        }
      }
    }

    return NextResponse.json({
      bab: rows.map((b) => ({ ...b, sub_keys: subKeysByBab[b.id] || [] })),
    });
  } catch (e) {
    console.error("[API Bab GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
