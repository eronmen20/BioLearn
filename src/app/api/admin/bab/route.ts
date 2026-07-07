import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - List all bab
export async function GET() {
  try {
    const supabase = getDb();
    const { data, error } = await supabase
      .from("bab")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ bab: data || [] });
  } catch (e) {
    console.error("[API Bab GET]", e);
    const msg = e instanceof Error ? e.message : typeof e === 'object' && e !== null ? JSON.stringify(e) : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST - Create bab
export async function POST(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "ID bab wajib diisi" }, { status: 400 });
    }

    // Check if already exists
    const { data: existing } = await supabase.from("bab").select("id").eq("id", body.id).single();
    if (existing) {
      return NextResponse.json({ error: `Bab dengan ID "${body.id}" sudah ada` }, { status: 409 });
    }

    const { error } = await supabase.from("bab").insert({
      id: body.id,
      icon: body.icon || "📚",
      color: body.color || "#6c5ce7",
      kelas_id: body.kelas_id || "x",
      video_id: body.video_id || null,
      video_title_id: body.video_title_id || null,
      video_title_en: body.video_title_en || null,
      hotspotted: body.hotspotted || null,
    });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API Bab POST]", e);
    const msg = e instanceof Error ? e.message : typeof e === 'object' && e !== null ? JSON.stringify(e) : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT - Update bab
export async function PUT(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "ID bab wajib diisi" }, { status: 400 });
    }

    // Build update payload only from fields actually provided (so existing rows
    // don't get nulled out when admin only wants to flip is_archived)
    const updateFields: Record<string, unknown> = {};
    if (body.icon !== undefined) updateFields.icon = body.icon;
    if (body.color !== undefined) updateFields.color = body.color;
    if (body.kelas_id !== undefined) updateFields.kelas_id = body.kelas_id;
    if (body.video_id !== undefined) updateFields.video_id = body.video_id;
    if (body.video_title_id !== undefined) updateFields.video_title_id = body.video_title_id;
    if (body.video_title_en !== undefined) updateFields.video_title_en = body.video_title_en;
    if (body.hotspotted !== undefined) updateFields.hotspotted = body.hotspotted;
    if (body.is_archived !== undefined) {
      updateFields.is_archived = body.is_archived;
      updateFields.archived_at = body.is_archived ? new Date().toISOString() : null;
    }
    updateFields.updated_at = new Date().toISOString();

    const { error } = await supabase.from("bab").update(updateFields).eq("id", body.id);

    if (error) throw error;
    return NextResponse.json({ success: true, is_archived: updateFields.is_archived ?? null });
  } catch (e) {
    console.error("[API Bab PUT]", e);
    const msg = e instanceof Error ? e.message : typeof e === 'object' && e !== null ? JSON.stringify(e) : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE - Delete bab
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // Delete all materi in this bab first (cascade)
    await supabase.from("materi").delete().eq("bab_id", id);

    const { error } = await supabase.from("bab").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API Bab DELETE]", e);
    const msg = e instanceof Error ? e.message : typeof e === 'object' && e !== null ? JSON.stringify(e) : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
