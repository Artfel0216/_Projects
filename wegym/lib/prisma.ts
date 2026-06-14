import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const NODE_ENV = process.env.NODE_ENV ?? "development";

declare global {
  var prisma: PrismaClient | undefined;
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL não definida no .env");
}

const adapter = new PrismaPg(databaseUrl);

const createPrismaClient = () =>
  new PrismaClient({
    adapter,
    log: NODE_ENV === "development"
      ? ["error", "warn"]
      : ["error"],
  });

export const prisma =
  global.prisma ?? createPrismaClient();

if (NODE_ENV !== "production") {
  global.prisma = prisma;
}
