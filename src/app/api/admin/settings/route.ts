import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - Get setting by key
export async function GET(req: NextRequest) {
  try {
    const supabase = getDb();
    const key = new URL(req.url).searchParams.get("key");

    if (!key) {
      // Return all settings
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      return NextResponse.json({ settings: data || [] });
    }

    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("key", key)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return NextResponse.json({ settings: data || null });
  } catch (e) {
    console.error("[API Settings GET]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST - Upsert setting
export async function POST(req: NextRequest) {
  try {
    const supabase = getDb();
    const body = await req.json();

    if (!body.key) {
      return NextResponse.json({ error: "key wajib diisi" }, { status: 400 });
    }

    const { error } = await supabase
      .from("site_settings")
      .upsert({
        key: body.key,
        value: body.value,
        updated_at: new Date().toISOString(),
      }, { onConflict: "key" });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API Settings POST]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
