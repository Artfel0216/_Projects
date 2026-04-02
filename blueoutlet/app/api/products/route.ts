import { NextResponse } from "next/server";
import { Category, Gender, Prisma } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const limit = Math.max(1, Math.min(parseInt(searchParams.get("limit") || "50", 10), 100));
    const categoryParam = searchParams.get("category") as Category;
    const genderParam = searchParams.get("gender") as Gender;

    const whereClause: Prisma.ProductWhereInput = { isActive: true };

    if (categoryParam && Object.values(Category).includes(categoryParam)) {
      whereClause.category = categoryParam;
    }

    if (genderParam && Object.values(Gender).includes(genderParam)) {
      whereClause.gender = genderParam;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        category: true,
        gender: true,
        brand: {
          select: { name: true },
        },
        images: {
          select: { imagePath: true },
          orderBy: { order: "asc" },
        },
        sizes: {
          select: { size: true, stock: true },
          orderBy: { size: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand?.name || "Sem Marca",
      category: product.category,
      gender: product.gender,
      price: Number(product.price),
      description: product.description ?? "",
      images: product.images.length > 0
        ? product.images.map((img) =>
            img.imagePath.startsWith("http") || img.imagePath.startsWith("/") 
              ? img.imagePath 
              : `/${img.imagePath}`
          )
        : ["/placeholder.png"],
      sizes: product.sizes.map(s => ({
        size: s.size,
        stock: s.stock
      })),
    }));

    return NextResponse.json(formattedProducts, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
      },
    });
  } catch (error) {
    console.error("API_PRODUCTS_ERROR:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtos" },
      { status: 500 }
    );
  }
}