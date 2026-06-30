import { NextRequest, NextResponse } from "next/server";
import { verifyCode, resetPassword } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
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
