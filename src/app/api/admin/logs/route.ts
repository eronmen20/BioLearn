import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

function sanitizeSearch(s: string): string {
  return s.replace(/[%()]/g, "").replace(/[*,]/g, " ");
}

// GET - Activity logs
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "0");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
    const action = searchParams.get("action");
    const targetType = searchParams.get("target_type");
    const search = searchParams.get("search");

    const supabase = getDb();
    let query = supabase
      .from("activity_logs")
      .select("*", { count: "exact" });

    if (action) {
      query = query.eq("action", action);
    }
    if (targetType) {
      query = query.eq("target_type", targetType);
    }
    if (search) {
      const safe = sanitizeSearch(search);
      query = query.or(`user_email.ilike.%${safe}%,action.ilike.%${safe}%,target_id.ilike.%${safe}%`);
    }

    query = query
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      logs: data || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (e) {
    console.error("[Admin Logs GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Clear old logs (older than 30 days)
export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const supabase = getDb();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { error, count } = await supabase
      .from("activity_logs")
      .delete()
      .lt("created_at", thirtyDaysAgo);

    if (error) throw error;

    return NextResponse.json({ success: true, deleted: count || 0 });
  } catch (e) {
    console.error("[Admin Logs DELETE]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
