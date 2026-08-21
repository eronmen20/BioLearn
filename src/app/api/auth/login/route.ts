import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/db";
import { generateAccessToken, generateRefreshToken } from "@/lib/admin-auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const { allowed } = await checkRateLimit(`auth:login:${ip}`, 10, 15 * 60 * 1000);
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

    const response = NextResponse.json({ user });

    if (user.role === "admin") {
      const isProd = process.env.NODE_ENV === "production";
      const accessToken = generateAccessToken(user.email, user.role);
      const refreshToken = generateRefreshToken(user.email, user.role);

      response.cookies.set("access_token", accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        path: "/api/admin",
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

    return response;
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
