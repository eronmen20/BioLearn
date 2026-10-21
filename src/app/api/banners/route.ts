import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Public list of active banners (service role bypasses missing anon RLS)
export async function GET(req: NextRequest) {
  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const posisi = searchParams.get("posisi");

    let query = supabase
      .from("banners")
      .select("*")
      .eq("status", "aktif")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (posisi && posisi !== "all") {
      query = query.eq("posisi", posisi);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ banners: data || [] });
  } catch (e) {
    console.error("[Public Banners GET]", e);
    return NextResponse.json({ banners: [] }, { status: 500 });
  }
}
