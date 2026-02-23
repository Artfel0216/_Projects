import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// DICA: Em projetos reais, esse bloco de instância do Prisma 
// geralmente é isolado em um arquivo tipo 'src/lib/prisma.ts'
const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        brand: true,
        images: {
          orderBy: {
            order: "asc",
          },
        },
        sizes: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, 
    });

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand.name,
      category: product.category, 
      gender: product.gender,     
      price: Number(product.price), // CORREÇÃO: Conversão de Decimal para Number
      description: product.description ?? "",
      images:
        product.images.length > 0
          ? product.images.map((img) => 
              // CORREÇÃO: Evita a barra dupla (//) no caminho da imagem
              img.imagePath.startsWith("/") ? img.imagePath : `/${img.imagePath}`
            )
          : ["/placeholder.png"],
      sizes: product.sizes,
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar produtos." },
      { status: 500 }
    );
  }
}