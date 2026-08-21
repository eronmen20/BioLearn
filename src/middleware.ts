import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const payload = verifyAdminToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized: Invalid or expired token" }, { status: 401 });
  }

  if (payload.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-admin-email", payload.email);
  requestHeaders.set("x-admin-role", payload.role);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
