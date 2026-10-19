import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

// GET - List feedbacks
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const supabase = getDb();
    const { data, error } = await supabase
      .from("feedbacks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[Admin Feedback GET note]:", error.message);
      return NextResponse.json({ feedbacks: [] });
    }

    return NextResponse.json({ feedbacks: data || [] });
  } catch (e) {
    console.error("[Admin Feedback GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete feedback
export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;

    const supabase = getDb();
    const id = new URL(req.url).searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID feedback wajib diisi" }, { status: 400 });
    }

    const { error } = await supabase.from("feedbacks").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[Admin Feedback DELETE]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
