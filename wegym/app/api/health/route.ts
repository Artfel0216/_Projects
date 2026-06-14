import { prisma } from '@/lib/prisma';
import { json, cache } from '@/lib/api-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const result = await cache.getOrSet(
    'health:status',
    async () => {
      const checks: Record<string, { status: string; error?: string }> = {};
      let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

      try {
        await prisma.$queryRaw`SELECT 1`;
        checks.database = { status: 'ok' };
      } catch (err) {
        checks.database = { status: 'error', error: (err as Error).message };
        overall = 'degraded';
      }

      const required = [
        { key: 'DATABASE_URL', name: 'DATABASE_URL' },
        { key: 'NEXTAUTH_SECRET', name: 'NEXTAUTH_SECRET' },
        { key: 'NEXTAUTH_URL', name: 'NEXTAUTH_URL' },
      ];
      const missing = required.filter(v => !process.env[v.key]).map(v => v.name);

      checks.environment = {
        status: missing.length === 0 ? 'ok' : 'degraded',
        ...(missing.length > 0 && { error: `Faltando: ${missing.join(', ')}` }),
      };
      if (missing.length > 0) overall = 'degraded';

      return {
        status: overall,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version ?? '0.1.0',
        checks,
      };
    },
    30,
  );

  return json(result, result.status === 'healthy' ? 200 : 200, 30);
}
