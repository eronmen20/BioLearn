import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail, createVerificationCode } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendCodeEmail } from "@/lib/verification-email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-real-ip") || (req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim() || "unknown";
    const { allowed } = await checkRateLimit(`auth:register:${ip}`, 5, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
    }

    const { email, password, name } = await req.json();

    // SECURITY: input validation (type-safe, length-bounded) before DB calls.
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof name !== "string" ||
      !email.trim() ||
      !EMAIL_RE.test(email.trim()) ||
      email.length > 254 ||
      password.length < 6 ||
      password.length > 200 ||
      !name.trim() ||
      name.length > 100
    ) {
      return NextResponse.json({ error: "Data tidak valid. Periksa kembali isian kamu." }, { status: 400 });
    }

    const exists = await findUserByEmail(email.trim().toLowerCase());
    if (exists) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }

    await createUser(email.trim().toLowerCase(), password, name.trim());

    // SECURITY: no more automatic email_verified=true. Verify for real by
    // emailing a one-time code (resend via /api/auth/verify/send if delivery
    // fails). Failure to send does NOT block account creation.
    let needsVerification = false;
    try {
      const code = await createVerificationCode(email.trim().toLowerCase(), "verify_email");
      await sendCodeEmail({
        email: email.trim().toLowerCase(),
        name: name.trim(),
        code,
        subject: "Kode Verifikasi BioLearn",
        intro: "Gunakan kode berikut untuk memverifikasi email kamu:",
        footNote: "Jika kamu tidak mendaftar, abaikan email ini.",
      });
      needsVerification = true;
    } catch (e) {
      console.error("[Register] failed to send verification email:", e);
      needsVerification = true;
    }

    return NextResponse.json({ user: null, needsVerification });
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
