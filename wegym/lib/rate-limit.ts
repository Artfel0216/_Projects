// Rate limiting is handled globally in proxy.ts.
// This file is kept as a shared import for per-route overrides if needed,
// but all general API rate limiting is done at the proxy level.

const windows = new Map<string, number[]>();
const WINDOW_MS = 10_000;
const MAX_REQUESTS = 10;

export const ratelimit = {
  async limit(identifier: string): Promise<{ success: boolean }> {
    const now = Date.now();
    const timestamps = windows.get(identifier) ?? [];
    const withinWindow = timestamps.filter((t) => now - t < WINDOW_MS);
    if (withinWindow.length >= MAX_REQUESTS) {
      return { success: false };
    }
    withinWindow.push(now);
    windows.set(identifier, withinWindow);
    return { success: true };
  },
};
