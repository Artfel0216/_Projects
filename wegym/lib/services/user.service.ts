import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { ConflictError, ValidationError, NotFoundError } from '@/lib/errors';
import { validateCref } from '@/lib/cref';
import type { RegisterInput } from '@/lib/validation';

export const userService = {
  async register(data: RegisterInput) {
    const email = data.email.toLowerCase().trim();
    const now = new Date();

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existingUser) {
      throw new ConflictError('E-mail já cadastrado.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    if (data.userType === 'atleta') {
      return prisma.user.create({
        data: {
          email,
          passwordHash,
          role: 'atleta',
          termsAcceptedAt: now,
          privacyAcceptedAt: now,
          dataConsentAt: now,
          athlete: {
            create: {
              name: data.name,
              cpf: data.cpf?.replace(/\D/g, '') ?? '',
              cep: data.cep ?? '',
              city: data.city ?? '',
              state: data.state ?? '',
              sex: data.sex ?? 'outro',
              experienceLevel: data.experienceLevel ?? 'iniciante',
              age: data.age ? Number(data.age) : 0,
              heightCm: data.height ? Number(data.height) : 0,
              weightKg: data.weight ? Number(data.weight) : 0,
              injury: data.injury ?? null,
              healthIssues: data.healthIssues ?? null,
              medications: data.medications ?? null,
            },
          },
        },
        select: { id: true },
      });
    }

    const crefValidation = validateCref(data.cref ?? '');
    if (!crefValidation.valid) {
      throw new ValidationError(crefValidation.errors[0] ?? 'CREF inválido.');
    }

    const existingCref = await prisma.personalTrainer.findUnique({
      where: { cref: crefValidation.cref },
      select: { id: true },
    });
    if (existingCref) {
      throw new ConflictError('Este CREF já está cadastrado em nossa plataforma.');
    }

    return prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'personal',
        termsAcceptedAt: now,
        privacyAcceptedAt: now,
        dataConsentAt: now,
        personal: {
          create: {
            name: data.name,
            cref: crefValidation.cref ?? '',
          },
        },
      },
      select: { id: true },
    });
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { athlete: true, personal: true },
    });
    if (!user) throw new NotFoundError('Usuário');

    const avatarName = user.athlete?.name ?? user.personal?.name ?? 'Wegym';
    const avatarPlaceholder = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=ea580c&color=fff&size=256&bold=true`;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      athlete: user.athlete
        ? {
            id: user.athlete.id,
            name: user.athlete.name,
            city: user.athlete.city,
            state: user.athlete.state,
            age: user.athlete.age,
            heightCm: user.athlete.heightCm,
            weightKg: user.athlete.weightKg,
            sex: user.athlete.sex,
            experienceLevel: user.athlete.experienceLevel,
          }
        : null,
      personal: user.personal
        ? { id: user.personal.id, name: user.personal.name, cref: user.personal.cref }
        : null,
      avatarPlaceholder,
    };
  },

  async updateProfile(userId: string, data: { name?: string; weightKg?: number; heightCm?: number }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { athlete: true, personal: true },
    });
    if (!user) throw new NotFoundError('Usuário');

    if (user.role === 'atleta' && user.athlete) {
      const updateData: Record<string, unknown> = {};
      if (data.name?.trim()) updateData.name = data.name.trim();
      if (data.weightKg != null && data.weightKg > 0) updateData.weightKg = data.weightKg;
      if (data.heightCm != null && data.heightCm > 0) updateData.heightCm = Math.round(data.heightCm);
      if (Object.keys(updateData).length > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: { athlete: { update: updateData } },
        });
      }
    } else if (user.role === 'personal' && user.personal) {
      if (data.name?.trim()) {
        await prisma.user.update({
          where: { id: user.id },
          data: { personal: { update: { name: data.name.trim() } } },
        });
      }
    }

    return { message: 'Perfil atualizado' };
  },

  async exportData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { athlete: true, personal: true },
    });
    if (!user) throw new NotFoundError('Usuário');

    return {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        termsAcceptedAt: user.termsAcceptedAt,
        privacyAcceptedAt: user.privacyAcceptedAt,
        dataConsentAt: user.dataConsentAt,
        createdAt: user.createdAt,
      },
      ...(user.athlete && {
        athlete: {
          name: user.athlete.name,
          cpf: user.athlete.cpf,
          cep: user.athlete.cep,
          city: user.athlete.city,
          state: user.athlete.state,
          age: user.athlete.age,
          sex: user.athlete.sex,
          heightCm: user.athlete.heightCm,
          weightKg: user.athlete.weightKg,
          experienceLevel: user.athlete.experienceLevel,
          injury: user.athlete.injury,
          healthIssues: user.athlete.healthIssues,
          medications: user.athlete.medications,
        },
      }),
      ...(user.personal && {
        personal: { name: user.personal.name, cref: user.personal.cref },
      }),
    };
  },

  async deleteAccount(userId: string) {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { athlete: true, personal: true },
      });
      if (!user) throw new NotFoundError('Usuário');

      if (user.athlete) {
        await tx.trainingPlan.deleteMany({ where: { athleteId: user.athlete.id } });
        await tx.progressEntry.deleteMany({ where: { athleteId: user.athlete.id } });
        await tx.weeklyClass.deleteMany({ where: { athleteId: user.athlete.id } });
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          email: `deleted-${userId.slice(0, 8)}@anon.wegym`,
          passwordHash: '',
          role: 'atleta',
          termsAcceptedAt: null,
          privacyAcceptedAt: null,
          dataConsentAt: null,
          markedForDeletionAt: null,
          anonymizedAt: new Date(),
          athlete: user.athlete
            ? {
                update: {
                  name: '[excluído]',
                  cpf: '00000000000',
                  cep: '',
                  city: '',
                  state: '',
                  injury: null,
                  healthIssues: null,
                  medications: null,
                },
              }
            : undefined,
          personal: user.personal
            ? { update: { name: '[excluído]', cref: '' } }
            : undefined,
        },
      });
    });

    return { success: true };
  },
};
