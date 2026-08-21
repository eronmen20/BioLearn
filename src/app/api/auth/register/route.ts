import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { allowed } = checkRateLimit(`auth:register:${ip}`, 5, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
    }

    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const exists = await findUserByEmail(email);
    if (exists) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }

    const user = await createUser(email, password, name);

    // Auto-verify for development (Resend free tier limitation)
    // In production, use verified domain in Resend
    try {
      const { createClient } = require("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await supabase.from("users").update({ email_verified: true }).eq("email", email);
    } catch {
      // ignore
    }

    return NextResponse.json({ user, needsVerification: false });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
