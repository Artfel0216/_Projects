import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateCref } from "@/lib/cref";
import { ratelimit } from "@/lib/rate-limit";

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
      return NextResponse.json({ error: "Too many requests", valid: false }, { status: 429 });
    }

    const { cref } = body;
    const validation = validateCref(cref);

    if (!validation.valid) {
      return NextResponse.json({
        valid: false,
        errors: validation.errors,
        cref: validation.cref,
      }, { status: 400 });
    }

    const existingTrainer = await prisma.personalTrainer.findUnique({
      where: { cref: validation.cref },
      select: { id: true },
    });

    if (existingTrainer) {
      return NextResponse.json({
        valid: false,
        errors: ["Este CREF já está cadastrado em nossa plataforma."],
        cref: validation.cref,
      }, { status: 409 });
    }

    return NextResponse.json({
      valid: true,
      cref: validation.cref,
      normalizedCref: validation.normalizedCref,
    }, { status: 200 });

  } catch (error) {
    console.error("Erro na validação de CREF:", error);
    return NextResponse.json({
      valid: false,
      errors: ["Erro interno ao validar CREF. Tente novamente."],
    }, { status: 500 });
  }
}
