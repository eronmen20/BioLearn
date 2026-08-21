import { getDb } from "@/lib/db";

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const db = getDb();
    const { data, error } = await db.rpc("check_rate_limit", {
      p_key: key,
      p_max: maxRequests,
      p_window_ms: windowMs,
    });

    if (error || !data || !data[0]) {
      // If RPC fails (table doesn't exist yet), allow the request
      return { allowed: true, remaining: maxRequests - 1 };
    }

    return {
      allowed: data[0].allowed,
      remaining: data[0].remaining,
    };
  } catch {
    // Fail open — allow request if rate limiter errors
    return { allowed: true, remaining: maxRequests - 1 };
  }
}
