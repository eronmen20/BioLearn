import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createVerificationCode, findUserByEmail } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { allowed } = checkRateLimit(`auth:forgot-send:${ip}`, 3, 10 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi dalam beberapa menit." }, { status: 429 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    const { allowed: emailAllowed } = checkRateLimit(`auth:forgot-send:email:${email}`, 3, 10 * 60 * 1000);
    if (!emailAllowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan untuk email ini. Coba lagi dalam beberapa menit." }, { status: 429 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Email belum terdaftar" }, { status: 404 });
    }

    const code = await createVerificationCode(email, "reset_password");

    await getResend().emails.send({
      from: "BioLearn <onboarding@resend.dev>",
      to: email,
      subject: "Reset Password BioLearn",
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6c5ce7; text-align: center;">🧬 BioLearn</h2>
          <p style="font-size: 14px; color: #333;">Halo <b>${user.name}</b>,</p>
          <p style="font-size: 14px; color: #333;">Kami menerima permintaan reset password untuk akun kamu. Gunakan kode berikut:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #6c5ce7; background: #f0edff; padding: 12px 24px; border-radius: 12px;">${code}</span>
          </div>
          <p style="font-size: 12px; color: #999; text-align: center;">Kode ini berlaku selama 10 menit.</p>
          <p style="font-size: 12px; color: #999; text-align: center;">Jika kamu tidak meminta reset password, abaikan email ini.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Gagal mengirim kode reset" }, { status: 500 });
  }
}
