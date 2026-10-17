import type { NextRequest } from "next/server";

// Extract the regular-user session token from either the httpOnly cookie
// (normal browser path) or an Authorization header (scripted clients).
export function extractUserToken(req: NextRequest): string | null {
  const cookieToken = req.cookies.get("biolearn_token")?.value;
  if (cookieToken) return cookieToken;
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return null;
}
