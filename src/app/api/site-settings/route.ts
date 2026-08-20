import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - Public homepage settings (safe, non-sensitive fields only)
export async function GET(req: NextRequest) {
  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key") || "homepage";

    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("key", key)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return NextResponse.json({ settings: data?.value || null });
  } catch (e) {
    console.error("[API Site Settings GET]", e);
    return NextResponse.json({ settings: null }, { status: 500 });
  }
}