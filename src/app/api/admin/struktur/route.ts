import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - List struktur (optionally filtered by bab_id)
export async function GET(req: NextRequest) {
  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const babId = searchParams.get("bab_id");

    let query = supabase
      .from("struktur_fungsi")
      .select("id, bab_id, sub_bab_key, title, title_en, image_url, image_alt, flashcards, sort_order")
      .order("sort_order", { ascending: true });
    if (babId) query = query.eq("bab_id", babId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ struktur: data || [] });
  } catch (e) {
    console.error("[API Struktur GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create struktur
export async function POST(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = await req.json();

    if (!body.bab_id || !body.title) {
      return NextResponse.json({ error: "bab_id dan title wajib diisi" }, { status: 400 });
    }

    const { data, error } = await supabase.from("struktur_fungsi").insert({
      bab_id: body.bab_id,
      sub_bab_key: body.sub_bab_key || null,
      title: body.title,
      title_en: body.title_en || null,
      image_url: body.image_url || null,
      image_alt: body.image_alt || null,
      flashcards: body.flashcards || [],
      sort_order: body.sort_order || 0,
    }).select("id").single();

    if (error) throw error;
    return NextResponse.json({ success: true, id: data?.id });
  } catch (e) {
    console.error("[API Struktur POST]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update struktur
export async function PUT(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.title_en !== undefined) updateData.title_en = body.title_en;
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.image_alt !== undefined) updateData.image_alt = body.image_alt;
    if (body.sub_bab_key !== undefined) updateData.sub_bab_key = body.sub_bab_key;
    if (body.flashcards !== undefined) updateData.flashcards = body.flashcards;
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;

    const { error } = await supabase.from("struktur_fungsi").update(updateData).eq("id", body.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API Struktur PUT]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete struktur
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID wajib diisi untuk menghapus" }, { status: 400 });

    const { error } = await supabase.from("struktur_fungsi").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API Struktur DELETE]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
