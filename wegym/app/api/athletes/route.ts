import { requireRole, handleError, json, cache } from '@/lib/api-utils';
import { athleteService } from '@/lib/services/athlete.service';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    await requireRole(['personal']);

    const { searchParams } = new URL(req.url);
    const take = Math.min(Number(searchParams.get('take')) || 20, 50);
    const cursorParam = searchParams.get('cursor');
    const includePlans = searchParams.get('plans') === '1';
    const includeProgress = searchParams.get('progress') === '1';
    const includeClasses = searchParams.get('classes') === '1';

    const cacheKey = `athletes:list:${take}:${cursorParam ?? ''}:${includePlans ? '1' : '0'}${includeProgress ? '1' : '0'}${includeClasses ? '1' : '0'}`;

    const result = await cache.getOrSet(
      cacheKey,
      () => athleteService.list(cursorParam ?? undefined, take),
      30,
    );

    if (includePlans || includeProgress || includeClasses) {
      const relations = await athleteService.getRelations(
        result.data.map(a => a.id),
        { plans: includePlans, progress: includeProgress, classes: includeClasses },
      );

      const plansData = includePlans ? relations.plans : [];
      const progressData = includeProgress ? relations.progress : [];
      const classesData = includeClasses ? relations.classes : [];

      const plansMap = new Map<string, typeof plansData>();
      const progressMap = new Map<string, typeof progressData>();
      const classesMap = new Map<string, typeof classesData>();

      for (const p of plansData) {
        if (!plansMap.has(p.athleteId)) plansMap.set(p.athleteId, []);
        plansMap.get(p.athleteId)!.push(p);
      }
      for (const p of progressData) {
        if (!progressMap.has(p.athleteId)) progressMap.set(p.athleteId, []);
        progressMap.get(p.athleteId)!.push(p);
      }
      for (const c of classesData) {
        if (!classesMap.has(c.athleteId)) classesMap.set(c.athleteId, []);
        classesMap.get(c.athleteId)!.push(c);
      }

      const data = result.data.map(a => ({
        ...a,
        trainingPlans: includePlans ? plansMap.get(a.id) || [] : undefined,
        progressEntries: includeProgress ? progressMap.get(a.id) || [] : undefined,
        weeklyClasses: includeClasses ? classesMap.get(a.id) || [] : undefined,
      }));

      return json({ data, nextCursor: result.nextCursor, hasMore: result.hasMore });
    }

    return json(result, 200, 30);
  } catch (error) {
    return handleError(error);
  }
}
