import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { ratelimit } from "../../../../lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    
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

    if (!email || !password || !userType || !name) {
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

    const userData = {
      email,
      passwordHash,
      role: userType,
      ...(userType === "atleta" ? {
        athlete: {
          create: {
            name, cpf, cep, city, state, sex, experienceLevel, dietaryRestriction,
            age: Number(age),
            heightCm: Number(height),
            weightKg: Number(weight),
            dietaryAllergy: dietaryAllergy || null,
            injury: injury || null,
            healthIssues: healthIssues || null,
            medications: medications || null,
          },
        },
      } : userType === "personal" ? {
        personal: {
          create: { name, cref },
        },
      } : null),
    };

    if (!userData) {
      return NextResponse.json({ error: "Tipo de usuário inválido." }, { status: 400 });
    }

    await prisma.user.create({ 
      data: userData,
      select: { id: true } 
    });

    return NextResponse.json({ message: "Sucesso!" }, { status: 201 });

  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "E-mail, CPF ou CREF já cadastrados." }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}