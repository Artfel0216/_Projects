import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"; 
import { prisma } from "../../../../lib/prisma";
import { ratelimit } from "../../../../lib/rate-limit";

type UserType = "atleta" | "personal";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
    const [ratelimitResult, body] = await Promise.all([
      ratelimit.limit(ip),
      req.json()
    ]);

    if (!ratelimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const {
      userType, email, password, name, cpf, cep, city, state, 
      age, sex, height, weight, experienceLevel, dietaryRestriction,
      dietaryAllergy, injury, healthIssues, medications, cref
    } = body;

    if (!email || !password || !userType) {
      return NextResponse.json({ error: "Dados obrigatórios ausentes." }, { status: 400 });
    }

    const [existingUser, passwordHash] = await Promise.all([
      prisma.user.findUnique({
        where: { email },
        select: { id: true },
      }),
      bcrypt.hash(password, 10)
    ]);

    if (existingUser) {
      return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 400 });
    }

    const userData: any = {
      email,
      passwordHash,
      role: userType,
    };

    if (userType === "atleta") {
      userData.athlete = {
        create: {
          name, cpf, cep, city, state,
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
      };
    } else if (userType === "personal") {
      userData.personal = {
        create: { name, cref },
      };
    } else {
      return NextResponse.json({ error: "Tipo de usuário inválido." }, { status: 400 });
    }

    await prisma.user.create({ data: userData });

    return NextResponse.json({ message: "Cadastro realizado com sucesso!" }, { status: 201 });

  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "E-mail, CPF ou CREF já cadastrados." },
        { status: 400 }
      );
    }

    console.error("Erro no cadastro:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}