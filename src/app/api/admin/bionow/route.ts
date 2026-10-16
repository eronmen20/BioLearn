import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";
import { requireAdmin } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

function slugify(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

// GET - List semua post (termasuk draft)
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    let query = supabase.from("bionow_posts").select("*").order("sort_order", { ascending: true });
    if (id) query = query.eq("id", id);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ posts: data || [] });
  } catch (e) {
    console.error("[API BioNow Admin GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Buat post baru
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const supabase = getDb();
    const body = await req.json();

    if (!body.title_id?.trim()) {
      return NextResponse.json({ error: "Judul (ID) wajib diisi" }, { status: 400 });
    }

    const slug = (body.slug?.trim() || slugify(body.title_id)) || `post-${Date.now()}`;

    const { data, error } = await supabase
      .from("bionow_posts")
      .insert({
        slug,
        badge: body.badge || "Isu Terkini",
        title_id: body.title_id || "",
        title_en: body.title_en || "",
        summary_id: body.summary_id || "",
        summary_en: body.summary_en || "",
        body_id: body.body_id || "",
        body_en: body.body_en || "",
        infographic_url: body.infographic_url || "",
        infographic_caption_id: body.infographic_caption_id || "",
        infographic_caption_en: body.infographic_caption_en || "",
        bab_id: body.bab_id || null,
        sub_bab_key: body.sub_bab_key || null,
        tags: Array.isArray(body.tags) ? body.tags : [],
        published: !!body.published,
        published_at: body.published ? new Date().toISOString() : null,
        sort_order: body.sort_order ?? 0,
      })
      .select("id")
      .single();

    if (error) throw error;

    const adminEmail = req.headers.get("x-admin-email") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await logActivity({
      user_email: adminEmail,
      action: "create",
      target_type: "bionow_posts",
      target_id: data?.id,
      ip_address: ip,
    });

    return NextResponse.json({ success: true, id: data?.id });
  } catch (e) {
    console.error("[API BioNow Admin POST]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update post
export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const supabase = getDb();
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    const fields = [
      "slug", "badge",
      "title_id", "title_en",
      "summary_id", "summary_en",
      "body_id", "body_en",
      "infographic_url", "infographic_caption_id", "infographic_caption_en",
      "bab_id", "sub_bab_key", "tags",
      "published", "sort_order",
    ];
    for (const f of fields) {
      if (body[f] !== undefined) updateData[f] = body[f];
    }
    if (body.published === true) updateData.published_at = new Date().toISOString();

    const { error } = await supabase.from("bionow_posts").update(updateData).eq("id", body.id);
    if (error) throw error;

    const adminEmail = req.headers.get("x-admin-email") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await logActivity({
      user_email: adminEmail,
      action: "update",
      target_type: "bionow_posts",
      target_id: body.id,
      ip_address: ip,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API BioNow Admin PUT]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Hapus post
export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const supabase = getDb();
    const id = new URL(req.url).searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { error } = await supabase.from("bionow_posts").delete().eq("id", id);
    if (error) throw error;

    const adminEmail = req.headers.get("x-admin-email") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await logActivity({
      user_email: adminEmail,
      action: "delete",
      target_type: "bionow_posts",
      target_id: id,
      ip_address: ip,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API BioNow Admin DELETE]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
