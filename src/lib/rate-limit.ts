import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const isRedisConfigured = !!(redisUrl && redisToken);

const redis = isRedisConfigured
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;

const limiters = new Map<string, Ratelimit>();

function getLimiter(key: string, maxRequests: number, windowMs: number): Ratelimit {
  const cacheKey = `${key}:${maxRequests}:${windowMs}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowMs} ms`),
      analytics: false,
      prefix: "rl",
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

// In-memory fallback for local dev without Upstash
const memHits = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  if (isRedisConfigured && redis) {
    try {
      const limiter = getLimiter(key, maxRequests, windowMs);
      const result = await limiter.limit(key);
      return {
        allowed: result.success,
        remaining: result.remaining,
      };
    } catch {
      // Fall through to in-memory on Redis error
    }
  }

  // In-memory fallback
  const now = Date.now();
  const entry = memHits.get(key);

  if (!entry || now > entry.resetAt) {
    memHits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: maxRequests - entry.count };
}
