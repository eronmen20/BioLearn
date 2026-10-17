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
      // SECURITY (fail closed): the rate limiter previously allowed every
      // request when the RPC/table was missing, which silently disabled all
      // brute-force protection. Deny instead and log loudly so the operator
      // runs supabase-ratelimit-migration.sql.
      console.error(
        `[rate-limit] RPC check_rate_limit failed for key=${key} — denying request. ` +
          `Run supabase-ratelimit-migration.sql on the database. Detail:`,
        error?.message || "no row"
      );
      return { allowed: false, remaining: 0 };
    }

    return {
      allowed: data[0].allowed,
      remaining: data[0].remaining,
    };
  } catch (e) {
    // SECURITY (fail closed): infrastructure errors deny the request rather
    // than silently turning off brute-force protection.
    console.error(`[rate-limit] checkRateLimit threw for key=${key} — denying request. Detail:`, e);
    return { allowed: false, remaining: 0 };
  }
}
