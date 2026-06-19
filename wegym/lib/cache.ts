type StoreEntry = { data: unknown; expiresAt: number };

const redisUrl = () => process.env.REDIS_URL;

function prefix(key: string) {
  if (process.env.NODE_ENV === 'production') return `wegym:${key}`;
  return `wegym:dev:${key}`;
}

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

const memStore = new Map<string, StoreEntry>();

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const redis = await getRedis();
    if (redis) {
      const raw = await redis.get(prefix(key));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as StoreEntry;
      if (Date.now() > parsed.expiresAt) {
        await redis.del(prefix(key));
        return null;
      }
      return parsed.data as T;
    }

    const entry = memStore.get(prefix(key));
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      memStore.delete(prefix(key));
      return null;
    }
    return entry.data as T;
  },

  async set(key: string, value: unknown, ttlSeconds = 60) {
    const prefixed = prefix(key);
    const expiresAt = Date.now() + ttlSeconds * 1000;
    const entry = { data: value, expiresAt };

    const redis = await getRedis();
    if (redis) {
      await redis.set(prefixed, JSON.stringify(entry), { PX: ttlSeconds * 1000 });
      return;
    }

    memStore.set(prefixed, entry);
  },

  async del(key: string) {
    const prefixed = prefix(key);

    const redis = await getRedis();
    if (redis) {
      await redis.del(prefixed);
      return;
    }

    memStore.delete(prefixed);
  },

  async delPattern(pattern: string) {
    const prefixed = prefix(pattern);

    const redis = await getRedis();
    if (redis) {
      const keys = await redis.keys(`${prefixed}*`);
      if (keys.length > 0) await redis.del(keys);
      return;
    }

    for (const k of memStore.keys()) {
      if (k.startsWith(prefixed)) memStore.delete(k);
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
