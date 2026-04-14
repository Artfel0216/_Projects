import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "../../../../lib/prisma";
import { hashQueue } from "../../../../lib/queue";
import { ratelimit } from "../../../../lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await req.json();

    const {
      userType,
      email,
      password,
      name,
      cpf,
      cep,
      city,
      state,
      age,
      sex,
      height,
      weight,
      experienceLevel,
      dietaryRestriction,
      dietaryAllergy,
      injury,
      healthIssues,
      medications,
      cref,
    } = body;

    if (!email || !password || !userType) {
      return NextResponse.json({ error: "Dados obrigatórios ausentes." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (userType === "atleta") {
      await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: "atleta",
          athlete: {
            create: {
              name,
              cpf,
              cep,
              city,
              state,
              age: Number(age),
              sex,
              heightCm: Number(height),
              weightKg: Number(weight),
              experienceLevel,
              dietaryRestriction,
              dietaryAllergy: dietaryAllergy ?? null,
              injury: injury ?? null,
              healthIssues: healthIssues ?? null,
              medications: medications ?? null,
            },
          },
        },
      });
    } else if (userType === "personal") {
      await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: "personal",
          personal: {
            create: {
              name,
              cref,
            },
          },
        },
      });
    } else {
      return NextResponse.json({ error: "Tipo de usuário inválido." }, { status: 400 });
    }

    return NextResponse.json({ message: "OK" }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "E-mail, CPF ou CREF já cadastrados." },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}