import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - List quiz-v2 (optionally filtered by bab_id or sub_bab_key)
export async function GET(req: NextRequest) {
  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const babId = searchParams.get("bab_id");
    const subBabKey = searchParams.get("sub_bab_key");

    let query = supabase.from("sub_bab_quiz").select("*").order("sort_order", { ascending: true });
    if (babId) query = query.eq("bab_id", babId);
    if (subBabKey) query = query.eq("sub_bab_key", subBabKey);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ quiz: data || [] });
  } catch (e) {
    console.error("[API QuizV2 GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create quiz question
export async function POST(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = await req.json();

    if (!body.bab_id) {
      return NextResponse.json({ error: "bab_id wajib diisi" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("sub_bab_quiz")
      .insert({
        bab_id: body.bab_id,
        sub_bab_key: body.sub_bab_key || null,
        is_reflection: body.is_reflection || false,
        question_id: body.question_id || "",
        question_en: body.question_en || "",
        question_image_url: body.question_image_url || "",
        options_id: body.options_id || ["", "", "", ""],
        options_en: body.options_en || ["", "", "", ""],
        correct_answer: body.correct_answer ?? 0,
        explanation_id: body.explanation_id || "",
        explanation_en: body.explanation_en || "",
        sort_order: body.sort_order || 0,
      })
      .select("id")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, id: data?.id });
  } catch (e) {
    console.error("[API QuizV2 POST]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update quiz question
export async function PUT(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "ID soal wajib diisi" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.bab_id !== undefined) updateData.bab_id = body.bab_id;
    if (body.sub_bab_key !== undefined) updateData.sub_bab_key = body.sub_bab_key;
    if (body.is_reflection !== undefined) updateData.is_reflection = body.is_reflection;
    if (body.question_id !== undefined) updateData.question_id = body.question_id;
    if (body.question_en !== undefined) updateData.question_en = body.question_en;
    if (body.question_image_url !== undefined) updateData.question_image_url = body.question_image_url;
    if (body.options_id !== undefined) updateData.options_id = body.options_id;
    if (body.options_en !== undefined) updateData.options_en = body.options_en;
    if (body.correct_answer !== undefined) updateData.correct_answer = body.correct_answer;
    if (body.explanation_id !== undefined) updateData.explanation_id = body.explanation_id;
    if (body.explanation_en !== undefined) updateData.explanation_en = body.explanation_en;
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;

    const { error } = await supabase.from("sub_bab_quiz").update(updateData).eq("id", body.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API QuizV2 PUT]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete quiz question
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getDb();
    const id = new URL(req.url).searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { error } = await supabase.from("sub_bab_quiz").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API QuizV2 DELETE]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
