import { NextRequest, NextResponse } from "next/server";
import { generateAccessToken, verifyRefreshToken } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get("refresh_token")?.value;
    if (!refreshToken) {
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
    }

    const accessToken = generateAccessToken(payload.email, payload.role);
    const response = NextResponse.json({ success: true });

    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/api/admin",
      maxAge: 15 * 60,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
