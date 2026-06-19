// Rate limiting is handled globally in proxy.ts.
// This file is kept as a shared import for per-route overrides if needed,
// but all general API rate limiting is done at the proxy level.

const WINDOW_MS = 10_000;
const MAX_REQUESTS = 10;

const redisUrl = () => process.env.REDIS_URL;

const memWindows = new Map<string, number[]>();

let redisClient: Awaited<ReturnType<typeof createRedisClient>> | null = null;

async function createRedisClient() {
  const { createClient } = await import('redis');
  const client = createClient({ url: redisUrl() });
  client.on('error', () => { redisClient = null; });
  await client.connect();
  return client;
}

async function getRedis() {
  if (!redisUrl()) return null;
  if (redisClient?.isOpen) return redisClient;
  try {
    redisClient = await createRedisClient();
    return redisClient;
  } catch {
    redisClient = null;
    return null;
  }
}

export const ratelimit = {
  async limit(identifier: string): Promise<{ success: boolean }> {
    const redis = await getRedis();
    if (redis) {
      const key = `ratelimit:${identifier}`;
      const current = await redis.incr(key);
      if (current === 1) await redis.pExpire(key, WINDOW_MS);
      return { success: current <= MAX_REQUESTS };
    }

    const now = Date.now();
    const timestamps = memWindows.get(identifier) ?? [];
    const withinWindow = timestamps.filter((t) => now - t < WINDOW_MS);
    if (withinWindow.length >= MAX_REQUESTS) {
      return { success: false };
    }
    withinWindow.push(now);
    memWindows.set(identifier, withinWindow);
    return { success: true };
  },
};
