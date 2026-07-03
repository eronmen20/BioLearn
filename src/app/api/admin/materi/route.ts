import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - List materi (optionally filtered by bab_id)
export async function GET(req: NextRequest) {
  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const babId = searchParams.get("bab_id");

    let query = supabase.from("materi").select("*").order("sort_order", { ascending: true });
    if (babId) query = query.eq("bab_id", babId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ materi: data || [] });
  } catch (e) {
    console.error("[API Materi GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create materi
export async function POST(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = await req.json();

    if (!body.bab_id) {
      return NextResponse.json({ error: "bab_id wajib diisi" }, { status: 400 });
    }

    const { data, error } = await supabase.from("materi").insert({
      bab_id: body.bab_id,
      sub_bab_key: body.sub_bab_key || null,
      type: body.type || "html",
      content_id: body.content_id || "",
      content_en: body.content_en || "",
      summary_id: body.summary_id || "",
      summary_en: body.summary_en || "",
      sort_order: body.sort_order || 0,
      metadata: body.metadata || {},
    }).select("id").single();

    if (error) throw error;
    return NextResponse.json({ success: true, id: data?.id });
  } catch (e) {
    console.error("[API Materi POST]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update materi (by id)
export async function PUT(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "ID materi wajib diisi untuk update" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Only update fields that are provided
    if (body.bab_id !== undefined) updateData.bab_id = body.bab_id;
    if (body.sub_bab_key !== undefined) updateData.sub_bab_key = body.sub_bab_key;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.content_id !== undefined) updateData.content_id = body.content_id;
    if (body.content_en !== undefined) updateData.content_en = body.content_en;
    if (body.summary_id !== undefined) updateData.summary_id = body.summary_id;
    if (body.summary_en !== undefined) updateData.summary_en = body.summary_en;
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;

    const { error } = await supabase
      .from("materi")
      .update(updateData)
      .eq("id", body.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API Materi PUT]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete materi
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { error } = await supabase.from("materi").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API Materi DELETE]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
