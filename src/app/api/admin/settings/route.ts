import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { logActivity } from "@/lib/activity-log";

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

    const adminEmail = req.headers.get("x-admin-email") || "unknown";
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await logActivity({
      user_email: adminEmail,
      action: "update",
      target_type: "site_settings",
      target_id: body.key,
      detail: { value: body.value },
      ip_address: ip,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[API Settings POST]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
