import { NextRequest, NextResponse } from "next/server";
import { createVerificationCode, findUserByEmail } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendCodeEmail } from "@/lib/verification-email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-real-ip") || (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim() || "unknown";
    const { allowed } = await checkRateLimit(`auth:forgot-send:${ip}`, 3, 10 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi dalam beberapa menit." }, { status: 429 });
    }

    const { email } = await req.json();

    if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    const normalized = email.trim().toLowerCase();

    const { allowed: emailAllowed } = await checkRateLimit(`auth:forgot-send:email:${normalized}`, 3, 10 * 60 * 1000);
    if (!emailAllowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan untuk email ini. Coba lagi dalam beberapa menit." }, { status: 429 });
    }

    // ANTI-ENUMERATION: same generic response whether or not the email is
    // registered — previously a 404 leaked which addresses have accounts.
    const user = await findUserByEmail(normalized);
    if (user) {
      try {
        const code = await createVerificationCode(normalized, "reset_password");
        await sendCodeEmail({
          email: normalized,
          name: user.name || "",
          code,
          subject: "Reset Password BioLearn",
          intro: "Kami menerima permintaan reset password untuk akun kamu. Gunakan kode berikut:",
          footNote: "Jika kamu tidak meminta reset password, abaikan email ini.",
        });
      } catch (e) {
        console.error("[ForgotSend] failed to send reset email:", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Gagal mengirim kode reset" }, { status: 500 });
  }
}
