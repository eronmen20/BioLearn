import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    const user = await verifyPassword(email, password);
    if (!user) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    if (!user.email_verified) {
      return NextResponse.json({ error: "Email belum diverifikasi. Silakan cek inbox kamu.", needsVerification: true }, { status: 403 });
    }

    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
