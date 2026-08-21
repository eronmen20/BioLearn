import { NextRequest, NextResponse } from "next/server";
import { verifyCode, resetPassword } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { allowed } = checkRateLimit(`auth:forgot-reset:${ip}`, 5, 10 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
    }

    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }

    const valid = await verifyCode(email, code, "reset_password");
    if (!valid) {
      return NextResponse.json({ error: "Kode salah atau sudah kedaluwarsa" }, { status: 400 });
    }

    await resetPassword(email, newPassword);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
