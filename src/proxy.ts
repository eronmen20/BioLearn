import { NextRequest, NextResponse } from "next/server";

const SECRET = process.env.ADMIN_TOKEN_SECRET || "biolearn-fallback-secret-2024";

interface AdminTokenPayload {
  email: string;
  role: string;
  exp: number;
}

async function verifyToken(token: string): Promise<AdminTokenPayload | null> {
  if (!SECRET) return null;
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
    const expectedSig = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    if (signature !== expectedSig) return null;

    const payload: AdminTokenPayload = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")));
    if (!payload.email || !payload.role || !payload.exp) return null;
    if (Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  let token: string | null = null;

  const cookieToken = req.cookies.get("admin_token")?.value;
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

  const payload = await verifyToken(token);

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
