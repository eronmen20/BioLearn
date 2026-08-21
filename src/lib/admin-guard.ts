import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";

export async function requireAdmin(req: NextRequest): Promise<NextResponse | { email: string; role: string }> {
  // 1. Check headers set by middleware (middleware already verified the token)
  const adminEmail = req.headers.get("x-admin-email");
  const adminRole = req.headers.get("x-admin-role");
  if (adminEmail && adminRole) {
    return { email: adminEmail, role: adminRole };
  }

  // 2. Check Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = verifyAdminToken(token);
    if (payload && payload.role === "admin") {
      return { email: payload.email, role: payload.role };
    }
  }

  // 3. Check httpOnly cookie
  const cookieToken = req.cookies.get("admin_token")?.value;
  if (cookieToken) {
    const payload = verifyAdminToken(cookieToken);
    if (payload && payload.role === "admin") {
      return { email: payload.email, role: payload.role };
    }
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
