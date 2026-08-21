import { NextResponse } from "next/server";

export async function POST() {
  const isProd = process.env.NODE_ENV === "production";
  const response = NextResponse.json({ success: true });

  response.cookies.set("access_token", "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/api/admin",
    maxAge: 0,
  });

  response.cookies.set("refresh_token", "", {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/api/auth/refresh",
    maxAge: 0,
  });

  return response;
}
