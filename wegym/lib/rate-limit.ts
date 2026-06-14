// Rate limiting is handled globally in proxy.ts.
// This file is kept as a shared import for per-route overrides if needed,
// but all general API rate limiting is done at the proxy level.

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

const upstashLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "10 s"),
      analytics: true,
    })
  : null;

let warnedUnreachable = false;

export const ratelimit = {
  async limit(identifier: string): Promise<{ success: boolean }> {
    if (!upstashLimiter) return { success: true };
    try {
      const res = await upstashLimiter.limit(identifier);
      return { success: res.success };
    } catch (err) {
      if (!warnedUnreachable) {
        warnedUnreachable = true;
        console.warn(
          "[rate-limit] Upstash unreachable, allowing requests through:",
          err instanceof Error ? err.message : err,
        );
      }
      return { success: true };
    }
  },
};
