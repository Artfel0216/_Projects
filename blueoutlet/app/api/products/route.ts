import { NextResponse } from "next/server";
import { Category, Gender } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const category = searchParams.get("category") as Category | null;
    const gender = searchParams.get("gender") as Gender | null;

    const whereClause: any = { isActive: true };
    if (category) whereClause.category = category;
    if (gender) whereClause.gender = gender;

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
      brand: product.brand.name,
      category: product.category,
      gender: product.gender,
      price: Number(product.price),
      description: product.description ?? "",
      images: product.images.length > 0
        ? product.images.map((img) =>
            img.imagePath.startsWith("/") ? img.imagePath : `/${img.imagePath}`
          )
        : ["/placeholder.png"],
      sizes: product.sizes,
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}