import crypto from "crypto";

const SECRET = process.env.ADMIN_TOKEN_SECRET;
if (!SECRET) {
  console.error("[FATAL] ADMIN_TOKEN_SECRET is not set in environment variables. Admin tokens will not work.");
}
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface AdminTokenPayload {
  email: string;
  role: string;
  exp: number;
}

export function generateAdminToken(email: string, role: string): string {
  if (!SECRET) throw new Error("ADMIN_TOKEN_SECRET not configured");
  const payload: AdminTokenPayload = {
    email,
    role,
    exp: Date.now() + TOKEN_EXPIRY_MS,
  };
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
    if (!payload.email || !payload.role || !payload.exp) return null;
    if (Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}
