import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";

export const dynamic = "force-dynamic";

interface PraktikumPayload {
  id?: number;
  bab_id?: string;
  sub_bab_key?: string | null;
  title_id?: string;
  title_en?: string | null;
  description_id?: string | null;
  description_en?: string | null;
  image_url?: string | null;
  image_alt?: string | null;
  steps?: unknown;
  flashcards?: unknown;
  difficulty?: string;
  status?: string;
  sort_order?: number;
}

// GET - list (optionally filtered by bab_id)
export async function GET(req: NextRequest) {
  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const babId = searchParams.get("bab_id");

    let query = supabase
      .from("praktikum")
      .select("id, bab_id, sub_bab_key, title_id, title_en, description_id, description_en, image_url, image_alt, steps, flashcards, difficulty, status, sort_order, created_at, updated_at")
      .order("sort_order", { ascending: true });
    if (babId) query = query.eq("bab_id", babId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ praktikum: data || [] });
  } catch (e) {
    console.error("[API Admin Praktikum GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - create
export async function POST(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = (await req.json()) as PraktikumPayload;

    if (!body.bab_id || !body.title_id) {
      return NextResponse.json({ error: "bab_id dan title_id wajib diisi" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("praktikum")
      .insert({
        bab_id: body.bab_id,
        sub_bab_key: body.sub_bab_key || null,
        title_id: body.title_id,
        title_en: body.title_en || null,
        description_id: body.description_id || null,
        description_en: body.description_en || null,
        image_url: body.image_url || null,
        image_alt: body.image_alt || null,
        steps: body.steps || [],
        flashcards: body.flashcards || [],
        difficulty: body.difficulty || "sedang",
        status: body.status || "draft",
        sort_order: body.sort_order || 0,
      })
      .select("id")
      .single();

    if (error) throw error;

    const adminEmail = req.headers.get("x-admin-email") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await logActivity({
      user_email: adminEmail,
      action: "create",
      target_type: "praktikum",
      target_id: data?.id,
      ip_address: ip,
    });

    return NextResponse.json({ success: true, id: data?.id });
  } catch (e) {
    console.error("[API Admin Praktikum POST]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - update (only set fields that are present, so old data isn't blanked out)
export async function PUT(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = (await req.json()) as PraktikumPayload;

    if (!body.id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.bab_id !== undefined) updateData.bab_id = body.bab_id;
    if (body.sub_bab_key !== undefined) updateData.sub_bab_key = body.sub_bab_key || null;
    if (body.title_id !== undefined) updateData.title_id = body.title_id;
    if (body.title_en !== undefined) updateData.title_en = body.title_en;
    if (body.description_id !== undefined) updateData.description_id = body.description_id;
    if (body.description_en !== undefined) updateData.description_en = body.description_en;
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.image_alt !== undefined) updateData.image_alt = body.image_alt;
    if (body.steps !== undefined) updateData.steps = body.steps;
    if (body.flashcards !== undefined) updateData.flashcards = body.flashcards;
    if (body.difficulty !== undefined) updateData.difficulty = body.difficulty;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;

    const { error } = await supabase.from("praktikum").update(updateData).eq("id", body.id);
    if (error) throw error;

    const adminEmail = req.headers.get("x-admin-email") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await logActivity({
      user_email: adminEmail,
      action: "update",
      target_type: "praktikum",
      target_id: String(body.id),
      ip_address: ip,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API Admin Praktikum PUT]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - delete
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

    const { error } = await supabase.from("praktikum").delete().eq("id", id);
    if (error) throw error;

    const adminEmail = req.headers.get("x-admin-email") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await logActivity({
      user_email: adminEmail,
      action: "delete",
      target_type: "praktikum",
      target_id: id,
      ip_address: ip,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API Admin Praktikum DELETE]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
