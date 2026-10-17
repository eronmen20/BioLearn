import { NextRequest, NextResponse } from "next/server";
import { createVerificationCode, findUserByEmail } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendCodeEmail } from "@/lib/verification-email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-real-ip") || (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim() || "unknown";
    const { allowed } = await checkRateLimit(`auth:verify-send:${ip}`, 3, 10 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi dalam beberapa menit." }, { status: 429 });
    }

    const { email } = await req.json();

    if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    const { allowed: emailAllowed } = await checkRateLimit(`auth:verify-send:email:${normalized}`, 3, 10 * 60 * 1000);
    if (!emailAllowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan untuk email ini. Coba lagi dalam beberapa menit." }, { status: 429 });
    }

    // ANTI-ENUMERATION: the response body is identical whether or not the
    // email exists — previously a 404 "belum terdaftar" told attackers which
    // addresses are registered. We simply pretend success.
    const user = await findUserByEmail(normalized);
    if (user && !user.email_verified) {
      try {
        const code = await createVerificationCode(normalized);
        await sendCodeEmail({
          email: normalized,
          name: user.name || "",
          code,
          subject: "Kode Verifikasi BioLearn",
          intro: "Gunakan kode berikut untuk memverifikasi email kamu:",
          footNote: "Jika kamu tidak mendaftar, abaikan email ini.",
        });
      } catch (e) {
        console.error("[VerifySend] failed to send verification email:", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
