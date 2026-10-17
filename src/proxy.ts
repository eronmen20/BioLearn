import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/tokens";

// SECURITY: fail closed — the shared verifier has NO fallback secret, so if
// ADMIN_TOKEN_SECRET is unset every admin request is rejected instead of
// accepting tokens forged with a known default.

export async function proxy(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  let token: string | null = null;

  const cookieToken = req.cookies.get("access_token")?.value;
  if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });
  }

  const payload = await verifyToken(token, ["access"]);

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
