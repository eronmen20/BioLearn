import { NextRequest, NextResponse } from "next/server";
import { verifyCode } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { allowed } = await checkRateLimit(`auth:verify-confirm:${ip}`, 5, 10 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
    }

    const { email, code } = await req.json();

    if (
      typeof email !== "string" ||
      typeof code !== "string" ||
      !email.trim() ||
      code.length !== 6
    ) {
      return NextResponse.json({ error: "Email dan kode wajib diisi" }, { status: 400 });
    }

    const success = await verifyCode(email.trim().toLowerCase(), code);
    if (!success) {
      return NextResponse.json({ error: "Kode verifikasi salah atau sudah kedaluwarsa" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
