import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";
import { requireAdmin } from "@/lib/admin-guard";

// GET - List banners (or single by id)
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const supabase = getDb();
    const id = new URL(req.url).searchParams.get("id");

    if (id) {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return NextResponse.json({ banner: data });
    }

    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ banners: data || [] });
  } catch (e) {
    console.error("[Admin Banner GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create banner
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const supabase = getDb();
    const body = await req.json();

    if (!body.judul) {
      return NextResponse.json({ error: "judul wajib diisi" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("banners")
      .insert({
        judul: body.judul,
        deskripsi: body.deskripsi || "",
        posisi: body.posisi || "hero",
        status: body.status || "aktif",
        image_url: body.image_url || null,
        link_url: body.link_url || null,
        sort_order: body.sort_order || 0,
      })
      .select()
      .single();

    if (error) throw error;

    const adminEmail = req.headers.get("x-admin-email") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await logActivity({
      user_email: adminEmail,
      action: "create",
      target_type: "banners",
      target_id: data?.id,
      ip_address: ip,
    });

    return NextResponse.json({ success: true, id: data?.id, banner: data });
  } catch (e) {
    console.error("[Admin Banner POST]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update banner
export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const supabase = getDb();
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "ID banner wajib diisi" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if ("judul" in body) updates.judul = body.judul;
    if ("deskripsi" in body) updates.deskripsi = body.deskripsi;
    if ("posisi" in body) updates.posisi = body.posisi;
    if ("status" in body) updates.status = body.status;
    if ("image_url" in body) updates.image_url = body.image_url;
    if ("link_url" in body) updates.link_url = body.link_url;
    if ("sort_order" in body) updates.sort_order = body.sort_order;
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("banners")
      .update(updates)
      .eq("id", body.id)
      .select()
      .single();

    if (error) throw error;

    const adminEmail = req.headers.get("x-admin-email") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await logActivity({
      user_email: adminEmail,
      action: "update",
      target_type: "banners",
      target_id: body.id,
      ip_address: ip,
    });

    return NextResponse.json({ success: true, banner: data });
  } catch (e) {
    console.error("[Admin Banner PUT]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete banner
export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const supabase = getDb();
    const id = new URL(req.url).searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID banner wajib diisi" }, { status: 400 });
    }

    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) throw error;

    const adminEmail = req.headers.get("x-admin-email") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await logActivity({
      user_email: adminEmail,
      action: "delete",
      target_type: "banners",
      target_id: id,
      ip_address: ip,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[Admin Banner DELETE]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}