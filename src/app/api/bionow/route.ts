import { NextRequest, NextResponse } from "next/server";
import { getPublicDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Public BioNow posts (hanya yang published)
//   ?slug=xxx — detail satu post
//   tanpa slug — list semua, urut sort_order
export async function GET(req: NextRequest) {
  try {
    const supabase = getPublicDb();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    let query = supabase
      .from("bionow_posts")
      .select(
        "id, slug, badge, title_id, title_en, summary_id, summary_en, body_id, body_en, infographic_url, infographic_caption_id, infographic_caption_en, bab_id, sub_bab_key, tags, published_at, sort_order"
      )
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("published_at", { ascending: false });

    if (slug) query = query.eq("slug", slug);

    const { data, error } = await query;
    if (error) throw error;

    if (slug) {
      if (!data || data.length === 0) {
        return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
      }
      return NextResponse.json({ post: data[0] });
    }
    return NextResponse.json({ posts: data || [] });
  } catch (e) {
    console.error("[API BioNow Public GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
