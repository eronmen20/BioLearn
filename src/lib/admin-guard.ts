import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/admin-auth";

export async function requireAdmin(req: NextRequest): Promise<NextResponse | { email: string; role: string }> {
  // SECURITY: never trust x-admin-* request headers. They were previously
  // read here on the assumption only proxy.ts sets them, but any external
  // client can send arbitrary headers — so authorization must be verified
  // against the signed token on THIS server every single time.

  // 1. Check Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);
    if (payload && payload.role === "admin") {
      return { email: payload.email, role: payload.role };
    }
  }

  // 2. Check httpOnly cookie
  const cookieToken = req.cookies.get("access_token")?.value;
  if (cookieToken) {
    const payload = verifyAccessToken(cookieToken);
    if (payload && payload.role === "admin") {
      return { email: payload.email, role: payload.role };
    }
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
