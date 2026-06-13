import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const take = Math.min(Number(searchParams.get('take')) || 20, 50); 
    const cursorParam = searchParams.get('cursor');

    const includePlans = searchParams.get('plans') === '1';
    const includeProgress = searchParams.get('progress') === '1';
    const includeClasses = searchParams.get('classes') === '1';

    const athletes = await prisma.athlete.findMany({
      take: take + 1,
      orderBy: { id: 'desc' },
      ...(cursorParam ? { cursor: { id: cursorParam }, skip: 1 } : {}),
      select: {
        id: true,
        name: true,
        cpf: true,
        experienceLevel: true,
      },
    });

    const hasMore = athletes.length > take;
    const sliced = hasMore ? athletes.slice(0, take) : athletes;
    const nextCursor = hasMore ? sliced[sliced.length - 1].id : null;

    type AthleteRow = (typeof sliced)[number] & {
      trainingPlans?: unknown[];
      progressEntries?: unknown[];
      weeklyClasses?: unknown[];
    };
    let data: AthleteRow[] = sliced;
    const ids = sliced.map(a => a.id);

    if (ids.length > 0 && (includePlans || includeProgress || includeClasses)) {
      
      const [plans, progress, classes] = await Promise.all([
        includePlans
          ? prisma.trainingPlan.findMany({
              where: { athleteId: { in: ids } },
              select: {
                athleteId: true,
                day: true,
                exercises: {
                  select: { name: true, sets: true, reps: true, load: true }
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

      type PlanItem = { athleteId: string; day: string; exercises: { name: string; sets: string; reps: string; load: string }[] };
      type ProgressItem = { athleteId: string; date: Date; weight: number; muscleMass: number | null; bodyFat: number | null; note: string | null };
      type ClassItem = { id: string; athleteId: string; day: string; date: Date; time: string; type: string; status: string };
      const plansMap = new Map<string, PlanItem[]>();
      const progressMap = new Map<string, ProgressItem[]>();
      const classesMap = new Map<string, ClassItem[]>();

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
      { data, nextCursor, hasMore },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, no-store, must-revalidate',
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error("Erro na rota GET atletas:", error);
    return NextResponse.json(
      { error: 'Erro ao buscar atletas' },
      { status: 500 }
    );
  }
}