import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function avatarUrlFromName(name: string) {
  const safe = name.trim() || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(safe)}&background=ea580c&color=fff&size=256&bold=true`;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { athlete: true, personal: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
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
            dietaryRestriction: user.athlete.dietaryRestriction,
          }
        : null,
      personal: user.personal
        ? {
            id: user.personal.id,
            name: user.personal.name,
            cref: user.personal.cref,
          }
        : null,
      avatarPlaceholder: user.athlete
        ? avatarUrlFromName(user.athlete.name)
        : user.personal
          ? avatarUrlFromName(user.personal.name)
          : avatarUrlFromName("Wegym"),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = (await req.json()) as {
      name?: string;
      weightKg?: number;
      heightCm?: number;
    };

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { athlete: true, personal: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (user.role === "atleta" && user.athlete) {
      const data: { name?: string; weightKg?: number; heightCm?: number } = {};
      if (typeof body.name === "string" && body.name.trim().length > 0) {
        data.name = body.name.trim();
      }
      if (typeof body.weightKg === "number" && !Number.isNaN(body.weightKg) && body.weightKg > 0) {
        data.weightKg = body.weightKg;
      }
      if (typeof body.heightCm === "number" && !Number.isNaN(body.heightCm) && body.heightCm > 0) {
        data.heightCm = Math.round(body.heightCm);
      }
      if (Object.keys(data).length) {
        await prisma.user.update({
          where: { id: user.id },
          data: { athlete: { update: data } },
        });
      }
    } else if (user.role === "personal" && user.personal) {
      if (typeof body.name === "string" && body.name.trim().length > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: { personal: { update: { name: body.name.trim() } } },
        });
      }
    }

    return GET();
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
