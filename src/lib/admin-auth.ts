import crypto from "crypto";
import type { NextRequest } from "next/server";
import { TOKEN_TTL_MS, type TokenType } from "@/lib/tokens";

// SECURITY: no fallback secret. If ADMIN_TOKEN_SECRET is missing, token
// generation throws and verification returns null (fail closed).
const SECRET = process.env.ADMIN_TOKEN_SECRET || "";

interface AdminTokenPayload {
  email: string;
  role: string;
  exp: number;
  type: TokenType;
}

function signB64(payloadB64: string): string {
  if (!SECRET) {
    throw new Error("ADMIN_TOKEN_SECRET is not configured");
  }
  return crypto.createHmac("sha256", SECRET).update(payloadB64).digest("base64url");
}

export function extractAdminToken(req: NextRequest): string | null {
  const cookieToken = req.cookies.get("access_token")?.value;
  if (cookieToken) return cookieToken;
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return null;
}

export function generateAccessToken(email: string, role: string): string {
  const payload: AdminTokenPayload = { email, role, exp: Date.now() + TOKEN_TTL_MS.access, type: "access" };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadB64}.${signB64(payloadB64)}`;
}

export function generateRefreshToken(email: string, role: string): string {
  const payload: AdminTokenPayload = { email, role, exp: Date.now() + TOKEN_TTL_MS.refresh, type: "refresh" };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadB64}.${signB64(payloadB64)}`;
}

// Long-lived session token for regular users (e.g. /api/progress ownership).
export function generateUserToken(email: string, role: string): string {
  const payload: AdminTokenPayload = { email, role, exp: Date.now() + TOKEN_TTL_MS.user, type: "user" };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadB64}.${signB64(payloadB64)}`;
}

function verify(token: string, allowedType?: TokenType): AdminTokenPayload | null {
  if (!SECRET) return null;
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;

    // Constant-time compare to resist timing side-channels.
    const expectedSig = signB64(payloadB64);
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;

    const payload: AdminTokenPayload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    if (!payload.email || !payload.role || !payload.exp || !payload.type) return null;
    if (!["access", "refresh", "user"].includes(payload.type)) return null;
    if (allowedType && payload.type !== allowedType) return null;
    if (Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  return verify(token, "access");
}

export function verifyRefreshToken(token: string): AdminTokenPayload | null {
  return verify(token, "refresh");
}

export function verifyAccessToken(token: string): AdminTokenPayload | null {
  return verify(token, "access");
}

export function verifyUserToken(token: string): AdminTokenPayload | null {
  return verify(token, "user");
}
