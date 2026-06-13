import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";
import { ratelimit } from "../../../../lib/rate-limit";
import { validateCref } from "../../../../lib/cref";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(',')[0].trim() ?? "127.0.0.1";
    
    const [ratelimitResult, body] = await Promise.all([
      ratelimit.limit(ip),
      req.json()
    ]);

    if (!ratelimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const {
      userType, password, name, cpf, cep, city, state,
      age, sex, height, weight, experienceLevel,
      injury, healthIssues, medications, cref
    } = body;

    const email = String(body.email ?? "").trim().toLowerCase();

    if (!email || !password || !userType || !name) {
      return NextResponse.json({ error: "Dados obrigatórios ausentes." }, { status: 400 });
    }

    if (userType !== "atleta" && userType !== "personal") {
      return NextResponse.json({ error: "Tipo de usuário inválido." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userData: any = {
      email,
      passwordHash,
      role: userType,
    };

    if (userType === "atleta") {
      userData.athlete = {
        create: {
          name: name.trim(),
          cpf: cpf?.replace(/\D/g, '') || null, 
          cep, 
          city, 
          state, 
          sex, 
          experienceLevel,
          age: age ? Number(age) : null,
          heightCm: height ? Number(height) : null,
          weightKg: weight ? Number(weight) : null,
          injury: injury || null,
          healthIssues: healthIssues || null,
          medications: medications || null,
        },
      };
    } else if (userType === "personal") {
      const crefValidation = validateCref(cref || "");

      if (!crefValidation.valid) {
        return NextResponse.json({
          error: crefValidation.errors[0] || "CREF inválido.",
        }, { status: 400 });
      }

      const existingCref = await prisma.personalTrainer.findUnique({
        where: { cref: crefValidation.cref },
        select: { id: true },
      });

      if (existingCref) {
        return NextResponse.json({ error: "Este CREF já está cadastrado em nossa plataforma." }, { status: 409 });
      }

      userData.personal = {
        create: {
          name: name.trim(),
          cref: crefValidation.cref,
        },
      };
    }

    await prisma.user.create({ 
      data: userData,
      select: { id: true } 
    });

    return NextResponse.json({ message: "Sucesso!" }, { status: 201 });

  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "E-mail ou CPF já cadastrado." }, { status: 400 });
    }
    
    console.error("Erro interno no cadastro:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}