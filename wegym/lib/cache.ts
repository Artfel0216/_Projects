function prefix(key: string) {
  if (process.env.NODE_ENV === 'production') return `wegym:${key}`;
  return `wegym:dev:${key}`;
}

const store = new Map<string, { data: unknown; expiresAt: number }>();

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const entry = store.get(prefix(key));
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.delete(prefix(key));
      return null;
    }
    return entry.data as T;
  },

  async set(key: string, value: unknown, ttlSeconds = 60) {
    store.set(prefix(key), { data: value, expiresAt: Date.now() + ttlSeconds * 1000 });
  },

  async del(key: string) {
    store.delete(prefix(key));
  },

  async delPattern(pattern: string) {
    const prefixKey = prefix(pattern);
    for (const k of store.keys()) {
      if (k.startsWith(prefixKey)) store.delete(k);
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
