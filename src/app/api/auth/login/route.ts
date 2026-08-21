import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/db";
import { generateAdminToken } from "@/lib/admin-auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { allowed } = checkRateLimit(`auth:login:${ip}`, 10, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    const user = await verifyPassword(email, password);
    if (!user) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    // Skip verification check for now (auto-verified on register)
    // Re-enable when Resend custom domain is configured
    // if (!user.email_verified) {
    //   return NextResponse.json({ error: "Email belum diverifikasi. Silakan cek inbox kamu.", needsVerification: true }, { status: 403 });
    // }

    const response: { user: typeof user; token?: string } = { user };
    if (user.role === "admin") {
      response.token = generateAdminToken(user.email, user.role);
    }

    return NextResponse.json(response);
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
