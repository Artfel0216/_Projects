import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { ConflictError } from '@/lib/errors';
import type { AthleteRegisterInput } from '@/lib/validation';

export const athleteService = {
  async register(data: AthleteRegisterInput, personalId: string) {
    const email = data.email.toLowerCase().trim();
    const cpf = data.cpf.replace(/\D/g, '');

    return prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findFirst({
        where: { OR: [{ email }, { athlete: { cpf } }] },
        select: { id: true },
      });

      if (existingUser) {
        throw new ConflictError('Email ou CPF já cadastrado');
      }

      const tempPassword = crypto.randomUUID().slice(0, 16) + 'Aa1!';
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: 'atleta',
        },
        select: { id: true },
      });

      const athlete = await tx.athlete.create({
        data: {
          userId: user.id,
          personalId: personalId,
          name: data.name.trim(),
          cpf,
          age: data.birthDate
            ? Math.floor((Date.now() - new Date(data.birthDate).getTime()) / 31557600000)
            : 0,
          sex: data.sex,
          heightCm: Number(data.heightCm),
          weightKg: Number(data.weightKg),
          experienceLevel: data.experienceLevel,
          city: data.city,
          state: data.state,
          cep: data.cep,
        },
        select: { id: true, name: true },
      });

      return { athlete, tempPassword };
    }, { timeout: 10000 });
  },

  async list(cursor?: string, take = 20) {
    const takeClamped = Math.min(take, 50);
    const athletes = await prisma.athlete.findMany({
      take: takeClamped + 1,
      orderBy: { id: 'desc' },
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      select: {
        id: true,
        name: true,
        cpf: true,
        experienceLevel: true,
      },
    });

    const hasMore = athletes.length > takeClamped;
    const sliced = hasMore ? athletes.slice(0, takeClamped) : athletes;
    const nextCursor = hasMore ? sliced[sliced.length - 1].id : null;

    return { data: sliced, nextCursor, hasMore };
  },

  async getRelations(ids: string[], include: { plans?: boolean; progress?: boolean; classes?: boolean }) {
    if (ids.length === 0) return { plans: [], progress: [], classes: [] };

    const [plans, progress, classes_] = await Promise.all([
      include.plans
        ? prisma.trainingPlan.findMany({
            where: { athleteId: { in: ids } },
            select: {
              athleteId: true,
              day: true,
              exercises: { select: { name: true, sets: true, reps: true, load: true } },
            },
          })
        : Promise.resolve([]),
      include.progress
        ? prisma.progressEntry.findMany({
            where: { athleteId: { in: ids } },
            orderBy: { date: 'desc' },
            select: { athleteId: true, date: true, weight: true, muscleMass: true, bodyFat: true, note: true },
          })
        : Promise.resolve([]),
      include.classes
        ? prisma.weeklyClass.findMany({
            where: { athleteId: { in: ids } },
            orderBy: { date: 'asc' },
            select: { id: true, athleteId: true, day: true, date: true, time: true, type: true, status: true },
          })
        : Promise.resolve([]),
    ]);

    return { plans, progress, classes: classes_ };
  },
};
