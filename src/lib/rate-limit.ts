import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const isConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = isConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

const limiters = new Map<string, Ratelimit>();

function getLimiter(prefix: string, limit: number, windowSeconds: number) {
  const key = `${prefix}:${limit}:${windowSeconds}`;
  if (!limiters.has(key)) {
    limiters.set(
      key,
      new Ratelimit({
        redis: redis!,
        limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
        prefix,
      })
    );
  }
  return limiters.get(key)!;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
}

/**
 * Sliding-window rate limit keyed by `identifier` (write key, user id, or IP).
 * Until Upstash credentials are connected, this no-ops (fails open) so local
 * development and the placeholder-env build both work without a live Redis.
 */
export async function rateLimit(
  identifier: string,
  { prefix, limit, windowSeconds }: { prefix: string; limit: number; windowSeconds: number }
): Promise<RateLimitResult> {
  if (!redis) {
    return { success: true, limit, remaining: limit };
  }

  const { success, limit: cap, remaining } = await getLimiter(prefix, limit, windowSeconds).limit(
    identifier
  );

  return { success, limit: cap, remaining };
}
