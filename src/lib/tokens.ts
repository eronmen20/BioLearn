// Shared HMAC token helpers — must run in BOTH Node and Edge runtimes
// (proxy.ts runs in Edge, route handlers in Node). Therefore: Web Crypto,
// btoa/atob, no Buffer, no node:crypto, no next/* imports.
//
// Token format: base64url(json payload) + "." + base64url(HMAC-SHA256)
// The secret comes from ADMIN_TOKEN_SECRET and is REQUIRED — there is
// intentionally NO fallback secret (fail closed), see security audit F-A1.

export type TokenType = "access" | "refresh" | "user";

export interface TokenPayload {
  email: string;
  role: string;
  exp: number;
  type: TokenType;
}

export const TOKEN_TTL_MS: Record<TokenType, number> = {
  access: 7 * 24 * 60 * 60 * 1000, // 7 days (prevents premature session expiration)
  refresh: 30 * 24 * 60 * 60 * 1000, // 30 days
  user: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export function getTokenSecret(): string {
  return process.env.ADMIN_TOKEN_SECRET || "";
}

export function buildPayload(email: string, role: string, type: TokenType): TokenPayload {
  return { email, role, exp: Date.now() + TOKEN_TTL_MS[type], type };
}

export function bytesToBase64url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function base64urlToBytes(input: string): Uint8Array {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function encodePayload(payload: TokenPayload): string {
  const json = JSON.stringify(payload);
  return bytesToBase64url(new TextEncoder().encode(json));
}

export function decodePayload(payloadB64: string): TokenPayload | null {
  const json = new TextDecoder().decode(base64urlToBytes(payloadB64));
  const payload = JSON.parse(json) as TokenPayload;
  return payload;
}

// Constant-time byte comparison ( Defence-in-depth against timing attacks ).
export function timingSafeBytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function hmacSign(payloadB64: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
  return bytesToBase64url(new Uint8Array(sig));
}

export async function generateToken(
  email: string,
  role: string,
  type: TokenType,
  now: number = Date.now()
): Promise<string> {
  const secret = getTokenSecret();
  if (!secret) {
    throw new Error("ADMIN_TOKEN_SECRET is not configured");
  }
  const payload = { email, role, exp: now + TOKEN_TTL_MS[type], type };
  const payloadB64 = encodePayload(payload as TokenPayload);
  const signature = await hmacSign(payloadB64, secret);
  return `${payloadB64}.${signature}`;
}

// Verify a token. `allowedTypes` restricts which token types pass (fail closed).
export async function verifyToken(
  token: string | null | undefined,
  allowedTypes?: TokenType[],
  now: number = Date.now()
): Promise<TokenPayload | null> {
  const secret = getTokenSecret();
  if (!secret || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const [payloadB64, signature] = parts;

  try {
    const expectedSig = await hmacSign(payloadB64, secret);
    const sigOk = timingSafeBytesEqual(
      base64urlToBytes(signature),
      base64urlToBytes(expectedSig)
    );
    if (!sigOk) return null;

    const payload = decodePayload(payloadB64);
    if (!payload) return null;
    if (!payload.email || !payload.role || !payload.exp || !payload.type) return null;
    if (!["access", "refresh", "user"].includes(payload.type)) return null;
    if (allowedTypes && !allowedTypes.includes(payload.type)) return null;
    if (typeof now !== "number" || now > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

// Case-insensitive email ownership check for "may this session access this resource".
export function isOwnerEmail(tokenEmail: string, requestedEmail: string): boolean {
  if (!tokenEmail || !requestedEmail) return false;
  return tokenEmail.trim().toLowerCase() === String(requestedEmail).trim().toLowerCase();
}
