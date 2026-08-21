import crypto from "crypto";
import { NextRequest } from "next/server";

const SECRET = process.env.ADMIN_TOKEN_SECRET || "biolearn-fallback-secret-2024";
const ACCESS_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface AdminTokenPayload {
  email: string;
  role: string;
  exp: number;
  type: "access" | "refresh";
}

export function extractAdminToken(req: NextRequest): string | null {
  const cookieToken = req.cookies.get("access_token")?.value;
  if (cookieToken) return cookieToken;
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return null;
}

export function generateAccessToken(email: string, role: string): string {
  const payload: AdminTokenPayload = { email, role, exp: Date.now() + ACCESS_TOKEN_EXPIRY_MS, type: "access" };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(payloadB64).digest("base64url");
  return `${payloadB64}.${signature}`;
}

export function generateRefreshToken(email: string, role: string): string {
  const payload: AdminTokenPayload = { email, role, exp: Date.now() + REFRESH_TOKEN_EXPIRY_MS, type: "refresh" };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(payloadB64).digest("base64url");
  return `${payloadB64}.${signature}`;
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  if (!SECRET) return null;
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;

    const expectedSig = crypto.createHmac("sha256", SECRET).update(payloadB64).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) return null;

    const payload: AdminTokenPayload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    if (!payload.email || !payload.role || !payload.exp || !payload.type) return null;
    if (Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): AdminTokenPayload | null {
  const payload = verifyAdminToken(token);
  if (!payload || payload.type !== "refresh") return null;
  return payload;
}

export function verifyAccessToken(token: string): AdminTokenPayload | null {
  const payload = verifyAdminToken(token);
  if (!payload || payload.type !== "access") return null;
  return payload;
}
