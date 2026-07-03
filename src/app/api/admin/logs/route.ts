import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - Activity logs
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "0");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Placeholder - in production, you'd have an activity_logs table
    return NextResponse.json({
      logs: [],
      total: 0,
      page,
      limit,
    });
  } catch (e) {
    console.error("[Admin Logs GET]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create log entry
export async function POST(req: NextRequest) {
  try {
    const { action, details, userId } = await req.json();

    // Placeholder - in production, insert into activity_logs table
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[Admin Logs POST]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
