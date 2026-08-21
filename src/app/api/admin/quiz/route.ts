import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET
export async function GET(req: NextRequest) {
  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const babId = searchParams.get("bab_id");

    let query = supabase.from("quiz").select("*").order("sort_order", { ascending: true });
    if (babId) query = query.eq("bab_id", babId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ quiz: data || [] });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST
export async function POST(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = await req.json();
    const { error } = await supabase.from("quiz").insert({
      bab_id: body.bab_id,
      question_id: body.question_id,
      question_en: body.question_en,
      options_id: body.options_id,
      options_en: body.options_en,
      correct_answer: body.correct_answer,
      explanation_id: body.explanation_id,
      explanation_en: body.explanation_en,
      sort_order: body.sort_order || 0,
    });
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT
export async function PUT(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = await req.json();
    const { error } = await supabase.from("quiz").update({
      question_id: body.question_id,
      question_en: body.question_en,
      options_id: body.options_id,
      options_en: body.options_en,
      correct_answer: body.correct_answer,
      explanation_id: body.explanation_id,
      explanation_en: body.explanation_en,
    }).eq("id", body.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getDb();
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    const { error } = await supabase.from("quiz").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
