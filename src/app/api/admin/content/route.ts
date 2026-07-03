import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET - List all content
export async function GET(req: NextRequest) {
  try {
    const supabase = getDb();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // bab, flashcard, quiz, etc.

    // For now, return static data counts
    // In production, this would query actual content tables
    return NextResponse.json({
      content: [],
      total: 0,
      type: type || "all",
    });
  } catch (e) {
    console.error("[Admin Content GET]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create content
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: "Type dan data wajib diisi" },
        { status: 400 }
      );
    }

    // Placeholder for content creation
    return NextResponse.json({
      success: true,
      message: `Content type '${type}' created`,
    });
  } catch (e) {
    console.error("[Admin Content POST]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
