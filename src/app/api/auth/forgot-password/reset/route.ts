import { NextRequest, NextResponse } from "next/server";
import { verifyCode, resetPassword } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { allowed } = await checkRateLimit(`auth:forgot-reset:${ip}`, 5, 10 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
    }

    const { email, code, newPassword } = await req.json();

    if (
      typeof email !== "string" ||
      typeof code !== "string" ||
      typeof newPassword !== "string" ||
      !email.trim() ||
      code.length !== 6 ||
      newPassword.length < 6 ||
      newPassword.length > 200
    ) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    const valid = await verifyCode(normalized, code, "reset_password");
    if (!valid) {
      return NextResponse.json({ error: "Kode salah atau sudah kedaluwarsa" }, { status: 400 });
    }

    await resetPassword(normalized, newPassword);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
