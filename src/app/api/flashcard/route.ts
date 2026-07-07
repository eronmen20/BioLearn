import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - List flashcards (filtered by bab_id + sub_bab_key)
export async function GET(req: NextRequest) {
  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const babId = searchParams.get("bab_id");
    const subBabKey = searchParams.get("sub_bab_key");
    const admin = searchParams.get("admin") === "true";

    let query = supabase
      .from("flashcard")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (babId) query = query.eq("bab_id", babId);
    if (subBabKey && !admin) query = query.eq("sub_bab_key", subBabKey);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ cards: data || [] });
  } catch (e) {
    console.error("[API Flashcard GET]", e);
    const msg = e instanceof Error ? e.message : typeof e === "object" && e !== null ? JSON.stringify(e) : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST - Create flashcard
export async function POST(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = await req.json();

    if (!body.bab_id) return NextResponse.json({ error: "bab_id wajib diisi" }, { status: 400 });
    if (!body.sub_bab_key) return NextResponse.json({ error: "sub_bab_key wajib diisi (flashcard harus ditaruh di sub-bab tertentu)" }, { status: 400 });
    if (!body.front_id || !body.back_id) {
      return NextResponse.json({ error: "Pertanyaan (front_id) & Jawaban (back_id) wajib diisi" }, { status: 400 });
    }

    // Verify sub_bab_key exists
    const { data: subBabExists } = await supabase
      .from("sub_bab")
      .select("id")
      .eq("bab_id", body.bab_id)
      .eq("key", body.sub_bab_key)
      .maybeSingle();

    if (!subBabExists) {
      return NextResponse.json(
        { error: `Sub-bab "${body.sub_bab_key}" tidak ditemukan di BAB "${body.bab_id}". Pastikan key valid.` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("flashcard")
      .insert({
        bab_id: body.bab_id,
        sub_bab_key: body.sub_bab_key,
        front_id: body.front_id,
        front_en: body.front_en || body.front_id,
        back_id: body.back_id,
        back_en: body.back_en || body.back_id,
        sort_order: body.sort_order || 0,
      })
      .select("id")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, id: data?.id });
  } catch (e) {
    console.error("[API Flashcard POST]", e);
    const msg = e instanceof Error ? e.message : typeof e === "object" && e !== null ? JSON.stringify(e) : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT - Update flashcard
export async function PUT(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = await req.json();

    if (!body.id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

    const updateFields: Record<string, unknown> = {};
    if (body.bab_id !== undefined) updateFields.bab_id = body.bab_id;
    if (body.sub_bab_key !== undefined) updateFields.sub_bab_key = body.sub_bab_key;
    if (body.front_id !== undefined) updateFields.front_id = body.front_id;
    if (body.front_en !== undefined) updateFields.front_en = body.front_en;
    if (body.back_id !== undefined) updateFields.back_id = body.back_id;
    if (body.back_en !== undefined) updateFields.back_en = body.back_en;
    if (body.sort_order !== undefined) updateFields.sort_order = body.sort_order;

    // If changing sub_bab_key, verify it exists in target bab
    if (updateFields.sub_bab_key !== undefined && updateFields.bab_id) {
      const { data: subBabExists } = await supabase
        .from("sub_bab")
        .select("id")
        .eq("bab_id", updateFields.bab_id)
        .eq("key", updateFields.sub_bab_key)
        .maybeSingle();

      if (!subBabExists) {
        return NextResponse.json(
          { error: `Sub-bab "${updateFields.sub_bab_key}" tidak ditemukan di BAB "${updateFields.bab_id}".` },
          { status: 400 }
        );
      }
    }

    const { error } = await supabase
      .from("flashcard")
      .update(updateFields)
      .eq("id", body.id);

    if (error) throw error;
    return NextResponse.json({ success: true, id: body.id });
  } catch (e) {
    console.error("[API Flashcard PUT]", e);
    const msg = e instanceof Error ? e.message : typeof e === "object" && e !== null ? JSON.stringify(e) : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE - Delete flashcard
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

    const { error } = await supabase.from("flashcard").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true, id });
  } catch (e) {
    console.error("[API Flashcard DELETE]", e);
    const msg = e instanceof Error ? e.message : typeof e === "object" && e !== null ? JSON.stringify(e) : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
