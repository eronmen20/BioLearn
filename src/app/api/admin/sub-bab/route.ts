import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - List sub-bab (optionally filtered by bab_id)
export async function GET(req: NextRequest) {
  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const babId = searchParams.get("bab_id");

    let query = supabase.from("sub_bab").select("*").order("sort_order", { ascending: true });
    if (babId) query = query.eq("bab_id", babId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ sub_bab: data || [] });
  } catch (e) {
    console.error("[API SubBab GET]", e);
    const msg = e instanceof Error ? e.message : typeof e === 'object' && e !== null ? JSON.stringify(e) : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST - Create sub-bab (auto-shift sort_order)
export async function POST(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = await req.json();

    if (!body.bab_id) {
      return NextResponse.json({ error: "bab_id wajib diisi" }, { status: 400 });
    }

    const newSortOrder = body.sort_order || 0;

    // Auto-shift: increment sort_order for all existing records in same bab where sort_order >= newSortOrder
    if (newSortOrder > 0) {
      // First get all records that need shifting
      const { data: toShift } = await supabase
        .from("sub_bab")
        .select("id, sort_order")
        .eq("bab_id", body.bab_id)
        .gte("sort_order", newSortOrder)
        .order("sort_order", { ascending: false }); // descending so we shift from end

      // Shift each one by +1
      if (toShift && toShift.length > 0) {
        for (const row of toShift) {
          await supabase
            .from("sub_bab")
            .update({ sort_order: (row.sort_order as number) + 1 })
            .eq("id", row.id);
        }
      }
    }

    const { data, error } = await supabase
      .from("sub_bab")
      .insert({
        bab_id: body.bab_id,
        key: body.key || "",
        title_id: body.title_id || "",
        title_en: body.title_en || "",
        summary_id: body.summary_id || "",
        summary_en: body.summary_en || "",
        content_id: body.content_id || "",
        content_en: body.content_en || "",
        video_url: body.video_url || "",
        image_url: body.image_url || "",
        animation_url: body.animation_url || "",
        animation_type: body.animation_type || "",
        sort_order: newSortOrder,
      })
      .select("id")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, id: data?.id });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : typeof e === 'object' && e !== null ? JSON.stringify(e) : String(e);
    console.error("[API SubBab POST]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT - Update sub-bab
export async function PUT(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "ID sub-bab wajib diisi" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.bab_id !== undefined) updateData.bab_id = body.bab_id;
    if (body.key !== undefined) updateData.key = body.key;
    if (body.title_id !== undefined) updateData.title_id = body.title_id;
    if (body.title_en !== undefined) updateData.title_en = body.title_en;
    if (body.summary_id !== undefined) updateData.summary_id = body.summary_id;
    if (body.summary_en !== undefined) updateData.summary_en = body.summary_en;
    if (body.content_id !== undefined) updateData.content_id = body.content_id;
    if (body.content_en !== undefined) updateData.content_en = body.content_en;
    if (body.video_url !== undefined) updateData.video_url = body.video_url;
    if (body.image_url !== undefined) updateData.image_url = body.image_url;
    if (body.animation_url !== undefined) updateData.animation_url = body.animation_url;
    if (body.animation_type !== undefined) updateData.animation_type = body.animation_type;
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;

    const { error } = await supabase.from("sub_bab").update(updateData).eq("id", body.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API SubBab PUT]", e);
    const msg = e instanceof Error ? e.message : typeof e === 'object' && e !== null ? JSON.stringify(e) : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE - Delete sub-bab
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getDb();
    const id = new URL(req.url).searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { error } = await supabase.from("sub_bab").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API SubBab DELETE]", e);
    const msg = e instanceof Error ? e.message : typeof e === 'object' && e !== null ? JSON.stringify(e) : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
