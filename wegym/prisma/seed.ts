import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  const personal = await prisma.user.upsert({
    where: { email: "personal@wegym.com.br" },
    update: {},
    create: {
      email: "personal@wegym.com.br",
      passwordHash,
      role: "personal",
      personal: {
        create: {
          name: "Carlos Personal",
          cref: "CREF000001-G/SP",
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "joao@wegym.com.br" },
    update: {},
    create: {
      email: "joao@wegym.com.br",
      passwordHash,
      role: "atleta",
      athlete: {
        create: {
          personalId: personal.id,
          name: "João Silva",
          cpf: "12345678901",
          cep: "01001000",
          city: "São Paulo",
          state: "SP",
          age: 28,
          sex: "masculino",
          heightCm: 175,
          weightKg: 78.5,
          experienceLevel: "intermediario",
          injury: "Joelho direito (lesão LCA 2022)",
          healthIssues: null,
          medications: null,
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "maria@wegym.com.br" },
    update: {},
    create: {
      email: "maria@wegym.com.br",
      passwordHash,
      role: "atleta",
      athlete: {
        create: {
          personalId: personal.id,
          name: "Maria Oliveira",
          cpf: "98765432100",
          cep: "20040020",
          city: "Rio de Janeiro",
          state: "RJ",
          age: 24,
          sex: "feminino",
          heightCm: 163,
          weightKg: 62.0,
          experienceLevel: "iniciante",
          injury: null,
          healthIssues: null,
          medications: null,
        },
      },
    },
  });

  console.log("Seed executado com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
