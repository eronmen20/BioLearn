import { NextRequest, NextResponse } from "next/server";
import { getProgress, saveProgress } from "@/lib/db";
import { findUserByEmail } from "@/lib/db";

// GET /api/progress?email=xxx
export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const progress = getProgress(user.id);
    return NextResponse.json({ progress });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/progress
export async function POST(req: NextRequest) {
  try {
    const { email, babId, data } = await req.json();

    if (!email || !babId || !data) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    saveProgress(user.id, babId, data);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
