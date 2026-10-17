import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { logActivity } from "@/lib/activity-log";

export const dynamic = "force-dynamic";

export interface SpecimenRecord {
  id: string;
  name_id: string;
  name_en: string;
  latin_name?: string;
  category: "tumbuhan" | "hewan" | "mikroba" | "lainnya";
  description_id: string;
  description_en: string;
  image_url: string;
  recommended_mag: number;
  target_focus: number;
  is_published: boolean;
  sort_order: number;
  hotspots?: Array<{
    id: string;
    name_id: string;
    name_en: string;
    desc_id: string;
    desc_en: string;
    x: number;
    y: number;
  }>;
}

// GET - list all specimens
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const supabase = getDb();

    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "preparat_mikroskop")
      .maybeSingle();

    if (error) throw error;

    const specimens = Array.isArray(data?.value) ? data.value : [];
    return NextResponse.json({ specimens });
  } catch (e) {
    console.error("[API Admin Mikroskop GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - add new specimen
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const supabase = getDb();
    const body = (await req.json()) as SpecimenRecord;

    if (!body.name_id || !body.image_url) {
      return NextResponse.json({ error: "Nama preparat dan URL gambar wajib diisi" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "preparat_mikroskop")
      .maybeSingle();

    if (error) throw error;

    const currentList: SpecimenRecord[] = Array.isArray(data?.value) ? data.value : [];
    const newId = body.id?.trim() || `specimen-${Date.now()}`;

    const newRecord: SpecimenRecord = {
      id: newId,
      name_id: body.name_id.trim(),
      name_en: (body.name_en || body.name_id).trim(),
      latin_name: body.latin_name?.trim() || "",
      category: body.category || "tumbuhan",
      description_id: body.description_id?.trim() || "",
      description_en: body.description_en?.trim() || "",
      image_url: body.image_url.trim(),
      recommended_mag: Number(body.recommended_mag) || 10,
      target_focus: Number(body.target_focus) || 0,
      is_published: body.is_published !== false,
      sort_order: Number(body.sort_order) || currentList.length + 1,
      hotspots: Array.isArray(body.hotspots) ? body.hotspots : [],
    };

    const updatedList = [...currentList, newRecord];

    const { error: saveError } = await supabase.from("site_settings").upsert({
      key: "preparat_mikroskop",
      value: updatedList,
      updated_at: new Date().toISOString(),
    });

    if (saveError) throw saveError;

    await logActivity({
      user_email: auth.email,
      user_role: auth.role,
      action: "create",
      target_type: "preparat_mikroskop",
      target_id: newId,
      detail: { name: newRecord.name_id },
    });

    return NextResponse.json({ success: true, specimen: newRecord });
  } catch (e) {
    console.error("[API Admin Mikroskop POST]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - update existing specimen
export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const supabase = getDb();
    const body = (await req.json()) as SpecimenRecord;

    if (!body.id) {
      return NextResponse.json({ error: "ID preparat wajib disertakan" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "preparat_mikroskop")
      .maybeSingle();

    if (error) throw error;

    const currentList: SpecimenRecord[] = Array.isArray(data?.value) ? data.value : [];
    const index = currentList.findIndex((s) => s.id === body.id);

    if (index === -1) {
      return NextResponse.json({ error: "Preparat tidak ditemukan" }, { status: 404 });
    }

    const updatedRecord: SpecimenRecord = {
      ...currentList[index],
      name_id: body.name_id?.trim() || currentList[index].name_id,
      name_en: (body.name_en ?? currentList[index].name_en).trim(),
      latin_name: body.latin_name?.trim() ?? currentList[index].latin_name,
      category: body.category || currentList[index].category,
      description_id: body.description_id?.trim() ?? currentList[index].description_id,
      description_en: body.description_en?.trim() ?? currentList[index].description_en,
      image_url: body.image_url?.trim() || currentList[index].image_url,
      recommended_mag: Number(body.recommended_mag) || currentList[index].recommended_mag,
      target_focus: Number(body.target_focus) ?? currentList[index].target_focus,
      is_published: body.is_published !== undefined ? body.is_published : currentList[index].is_published,
      sort_order: Number(body.sort_order) || currentList[index].sort_order,
      hotspots: Array.isArray(body.hotspots) ? body.hotspots : currentList[index].hotspots,
    };

    currentList[index] = updatedRecord;

    const { error: saveError } = await supabase.from("site_settings").upsert({
      key: "preparat_mikroskop",
      value: currentList,
      updated_at: new Date().toISOString(),
    });

    if (saveError) throw saveError;

    await logActivity({
      user_email: auth.email,
      user_role: auth.role,
      action: "update",
      target_type: "preparat_mikroskop",
      target_id: body.id,
      detail: { name: updatedRecord.name_id },
    });

    return NextResponse.json({ success: true, specimen: updatedRecord });
  } catch (e) {
    console.error("[API Admin Mikroskop PUT]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - remove specimen
export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth instanceof NextResponse) return auth;
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID preparat wajib disertakan" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "preparat_mikroskop")
      .maybeSingle();

    if (error) throw error;

    const currentList: SpecimenRecord[] = Array.isArray(data?.value) ? data.value : [];
    const filtered = currentList.filter((s) => s.id !== id);

    const { error: saveError } = await supabase.from("site_settings").upsert({
      key: "preparat_mikroskop",
      value: filtered,
      updated_at: new Date().toISOString(),
    });

    if (saveError) throw saveError;

    await logActivity({
      user_email: auth.email,
      user_role: auth.role,
      action: "delete",
      target_type: "preparat_mikroskop",
      target_id: id,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API Admin Mikroskop DELETE]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
