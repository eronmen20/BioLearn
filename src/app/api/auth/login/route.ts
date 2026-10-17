import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/db";
import { generateAccessToken, generateRefreshToken, generateUserToken } from "@/lib/admin-auth";
import { checkRateLimit } from "@/lib/rate-limit";

// Use the ingress-provided IP (x-real-ip on Vercel is authoritative). The
// client-controllable x-forwarded-for list can be spoofed, so it is only a
// last-resort fallback and we take the FIRST hop (contents after the comma
// are attacker-inflatable garbage).
function getClientIp(req: NextRequest): string {
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const { allowed } = await checkRateLimit(`auth:login:${ip}`, 10, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    if (typeof email !== "string" || typeof password !== "string" || email.length > 254) {
      return NextResponse.json({ error: "Email dan password tidak valid" }, { status: 400 });
    }

    // Per-account lockout so rotating the (spoofable) IP header can't
    // brute-force a single mailbox forever. Keyed on the submitted email only
    // — the response is identical whether or not it is registered.
    const { allowed: emailAllowed } = await checkRateLimit(
      `auth:login:email:${email.trim().toLowerCase()}`,
      10,
      15 * 60 * 1000
    );
    if (!emailAllowed) {
      return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
    }

    const user = await verifyPassword(email, password);
    if (!user) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    // SECURITY: email verification is now real (register no longer sets
    // email_verified=true). Unverified accounts are prompted to verify instead
    // of silently grabbing a session. All pre-existing accounts were
    // auto-verified on creation, so this only gates genuinely-new accounts.
    if (user.email_verified === false) {
      return NextResponse.json(
        {
          error: "Email belum terverifikasi. Masukkan kode yang kami kirim.",
          needsVerification: true,
        },
        { status: 403 }
      );
    }

    const response = NextResponse.json({ user });

    const isProd = process.env.NODE_ENV === "production";

    if (user.role === "admin") {
      const accessToken = generateAccessToken(user.email, user.role);
      const refreshToken = generateRefreshToken(user.email, user.role);

      response.cookies.set("access_token", accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        // "/" so every server-side route handler (not only proxy-guarded
        // /api/admin paths) can verify the admin session itself.
        path: "/",
        maxAge: 15 * 60, // 15 minutes
      });

      response.cookies.set("refresh_token", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        path: "/api/auth/refresh",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }

    // Long-lived session cookie for regular (self-scoped) APIs such as
    // /api/progress. Issued for every role; the route handler checks ownership.
    const userToken = generateUserToken(user.email, user.role);
    response.cookies.set("biolearn_token", userToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
