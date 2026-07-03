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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create bab
export async function POST(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = await req.json();

    const { error } = await supabase.from("bab").insert({
      id: body.id,
      icon: body.icon || "📚",
      color: body.color || "#6c5ce7",
      video_id: body.video_id,
      video_title_id: body.video_title_id,
      video_title_en: body.video_title_en,
      hotspotted: body.hotspotted,
    });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API Bab POST]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update bab
export async function PUT(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = await req.json();

    const { error } = await supabase
      .from("bab")
      .update({
        icon: body.icon,
        color: body.color,
        video_id: body.video_id,
        video_title_id: body.video_title_id,
        video_title_en: body.video_title_en,
        hotspotted: body.hotspotted,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API Bab PUT]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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

    const { error } = await supabase.from("bab").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API Bab DELETE]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
