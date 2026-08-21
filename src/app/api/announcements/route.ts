import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Public list of published announcements (newest first, pinned first)
export async function GET(req: NextRequest) {
  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const payload = token ? verifyAdminToken(token) : null;
    const isAdmin = !!payload && payload.role === "admin";

    let query = supabase
      .from("announcements")
      .select("*")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (!isAdmin) {
      query = query.eq("status", "published");
    }

    const { data, error } = await query;
    if (error) throw error;

    const now = new Date().toISOString();
    const filtered = (data || []).filter((a) => {
      if (isAdmin) return true;
      if (a.starts_at && a.starts_at > now) return false;
      if (a.ends_at && a.ends_at < now) return false;
      return true;
    });

    return NextResponse.json({ announcements: filtered });
  } catch (e) {
    console.error("[API Announcements GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create announcement
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const payload = token ? verifyAdminToken(token) : null;
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getDb();
    const body = await req.json();

    if (!body.title || !body.body) {
      return NextResponse.json({ error: "Title dan body wajib diisi" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("announcements")
      .insert({
        title: body.title,
        title_en: body.title_en || null,
        body: body.body,
        body_en: body.body_en || null,
        pinned: body.pinned || false,
        status: body.status || "published",
        category: body.category || "info",
        icon: body.icon || "📣",
        bab_id: body.bab_id || null,
        starts_at: body.starts_at || null,
        ends_at: body.ends_at || null,
      })
      .select("id")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, id: data?.id });
  } catch (e) {
    console.error("[API Announcements POST]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update announcement
export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const payload = token ? verifyAdminToken(token) : null;
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getDb();
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
    }

    const updateFields: Record<string, unknown> = {};
    if (body.title !== undefined) updateFields.title = body.title;
    if (body.title_en !== undefined) updateFields.title_en = body.title_en;
    if (body.body !== undefined) updateFields.body = body.body;
    if (body.body_en !== undefined) updateFields.body_en = body.body_en;
    if (body.pinned !== undefined) updateFields.pinned = body.pinned;
    if (body.status !== undefined) updateFields.status = body.status;
    if (body.category !== undefined) updateFields.category = body.category;
    if (body.icon !== undefined) updateFields.icon = body.icon;
    if (body.bab_id !== undefined) updateFields.bab_id = body.bab_id;
    if (body.starts_at !== undefined) updateFields.starts_at = body.starts_at;
    if (body.ends_at !== undefined) updateFields.ends_at = body.ends_at;

    const { error } = await supabase
      .from("announcements")
      .update(updateFields)
      .eq("id", body.id);

    if (error) throw error;
    return NextResponse.json({ success: true, id: body.id });
  } catch (e) {
    console.error("[API Announcements PUT]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete announcement
export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const payload = token ? verifyAdminToken(token) : null;
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
    }

    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true, id });
  } catch (e) {
    console.error("[API Announcements DELETE]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
