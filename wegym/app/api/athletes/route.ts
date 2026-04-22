import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const take = Math.min(Number(searchParams.get('take')) || 20, 100);
    const cursorParam = searchParams.get('cursor');

    const includePlans = searchParams.get('plans') === '1';
    const includeProgress = searchParams.get('progress') === '1';
    const includeClasses = searchParams.get('classes') === '1';

    const baseQuery: any = {
      take: take + 1,
      orderBy: { id: 'desc' },
      select: {
        id: true,
        name: true,
        cpf: true,
        experienceLevel: true
      }
    };

    if (cursorParam) {
      baseQuery.cursor = { id: cursorParam };
      baseQuery.skip = 1;
    }

    const athletes = await prisma.athlete.findMany(baseQuery);

    const hasMore = athletes.length > take;
    const sliced = hasMore ? athletes.slice(0, take) : athletes;
    const nextCursor = hasMore ? sliced[sliced.length - 1].id : null;

    let data = sliced;

    if (includePlans || includeProgress || includeClasses) {
      const ids = sliced.map(a => a.id);

      const [plans, progress, classes] = await Promise.all([
        includePlans
          ? prisma.trainingPlan.findMany({
              where: { athleteId: { in: ids } },
              select: {
                athleteId: true,
                day: true,
                exercises: {
                  select: {
                    name: true,
                    sets: true,
                    reps: true,
                    load: true
                  }
                }
              }
            })
          : Promise.resolve([]),

        includeProgress
          ? prisma.progressEntry.findMany({
              where: { athleteId: { in: ids } },
              orderBy: { date: 'desc' },
              select: {
                athleteId: true,
                date: true,
                weight: true,
                muscleMass: true,
                bodyFat: true,
                note: true
              }
            })
          : Promise.resolve([]),

        includeClasses
  ? prisma.weeklyClass.findMany({
      where: { athleteId: { in: ids } },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        athleteId: true,
        day: true,
        date: true,
        time: true,
        type: true,
        status: true
      }
    })
  : Promise.resolve([])
      ]);

      const plansMap = new Map<string, any[]>();
      const progressMap = new Map<string, any[]>();
      const classesMap = new Map<string, any[]>();

      for (const p of plans) {
        if (!plansMap.has(p.athleteId)) plansMap.set(p.athleteId, []);
        plansMap.get(p.athleteId)!.push(p);
      }

      for (const p of progress) {
        if (!progressMap.has(p.athleteId)) progressMap.set(p.athleteId, []);
        progressMap.get(p.athleteId)!.push(p);
      }

     for (const c of classes) {
  if (!classesMap.has(c.athleteId)) classesMap.set(c.athleteId, []);
  classesMap.get(c.athleteId)!.push(c);
}

      data = sliced.map(a => ({
        ...a,
        trainingPlans: includePlans ? plansMap.get(a.id) || [] : undefined,
        progressEntries: includeProgress ? progressMap.get(a.id) || [] : undefined,
        weeklyClasses: includeClasses ? classesMap.get(a.id) || [] : undefined
      }));
    }

    return NextResponse.json(
      {
        data,
        nextCursor,
        hasMore
      },
      {
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );
  } catch {
    return NextResponse.json(
      { error: 'Erro ao buscar atletas' },
      { status: 500 }
    );
  }
}