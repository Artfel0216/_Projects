import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return Response.json(products);
  } catch (error) {
    return Response.json(
      { error: "Erro ao buscar produtos" },
      { status: 500 }
    );
  }
}
