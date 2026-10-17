import { NextResponse } from "next/server";
import { getPublicDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getPublicDb();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "preparat_mikroskop")
      .maybeSingle();

    if (error) throw error;

    const rawList = Array.isArray(data?.value) ? data.value : [];
    // Only return published specimens for public users, sorted by sort_order
    const specimens = rawList
      .filter((s: { is_published?: boolean }) => s.is_published !== false)
      .sort((a: { sort_order?: number }, b: { sort_order?: number }) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    return NextResponse.json({ specimens });
  } catch (e) {
    console.error("[API Public Mikroskop GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
