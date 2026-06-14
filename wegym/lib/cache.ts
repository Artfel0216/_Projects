import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

let warned = false;

function prefix(key: string) {
  if (process.env.NODE_ENV === 'production') return `wegym:${key}`;
  return `wegym:dev:${key}`;
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    try {
      return await redis.get<T>(prefix(key));
    } catch (err) {
      if (!warned) {
        warned = true;
        console.warn('[cache] Redis unreachable:', err instanceof Error ? err.message : err);
      }
      return null;
    }
  },

  async set(key: string, value: unknown, ttlSeconds = 60) {
    if (!redis) return;
    try {
      await redis.set(prefix(key), value, { ex: ttlSeconds });
    } catch {
      // silent fail
    }
  },

  async del(key: string) {
    if (!redis) return;
    try {
      await redis.del(prefix(key));
    } catch {
      // silent fail
    }
  },

  async delPattern(pattern: string) {
    if (!redis) return;
    try {
      const keys = await redis.keys(prefix(pattern));
      if (keys.length > 0) await redis.del(...keys);
    } catch {
      // silent fail
    }
  },

  async getOrSet<T>(key: string, fetch: () => Promise<T>, ttlSeconds = 60): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const data = await fetch();
    await this.set(key, data, ttlSeconds);
    return data;
  },
};
