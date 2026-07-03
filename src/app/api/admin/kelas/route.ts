import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - List kelas
export async function GET() {
  try {
    const supabase = getDb();
    const { data, error } = await supabase
      .from("kelas")
      .select("*")
      .order("id", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ kelas: data || [] });
  } catch (e) {
    console.error("[API Kelas GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Create kelas
export async function POST(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = await req.json();

    if (!body.id || !body.nama) {
      return NextResponse.json({ error: "id dan nama wajib diisi" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("kelas")
      .insert({
        id: body.id,
        nama: body.nama,
        nama_en: body.nama_en || "",
        deskripsi: body.deskripsi || "",
        deskripsi_en: body.deskripsi_en || "",
        icon: body.icon || "🎓",
        color: body.color || "#6c5ce7",
        sort_order: body.sort_order || 0,
      })
      .select("id")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, id: data?.id });
  } catch (e) {
    console.error("[API Kelas POST]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update kelas
export async function PUT(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "ID kelas wajib diisi" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.nama !== undefined) updateData.nama = body.nama;
    if (body.nama_en !== undefined) updateData.nama_en = body.nama_en;
    if (body.deskripsi !== undefined) updateData.deskripsi = body.deskripsi;
    if (body.deskripsi_en !== undefined) updateData.deskripsi_en = body.deskripsi_en;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.color !== undefined) updateData.color = body.color;
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;

    const { error } = await supabase.from("kelas").update(updateData).eq("id", body.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API Kelas PUT]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete kelas
export async function DELETE(req: NextRequest) {
  try {
    const supabase = getDb();
    const id = new URL(req.url).searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const { error } = await supabase.from("kelas").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API Kelas DELETE]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
