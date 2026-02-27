import { PrismaClient, Gender, Category, Prisma } from "@prisma/client";
import slugify from "slugify";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const PUBLIC_DIR = path.join(process.cwd(), "public");

const PRICE_MIN = 199.9;
const PRICE_MAX = 899.9;
const SIZE_START = 35;
const SIZE_COUNT = 9;

const BRAND_ALIASES: Record<string, string> = {
  adidas: "Adidas",
  nike: "Nike",
  boss: "Boss",
  hugoboss: "Boss",
  gucci: "Gucci",
  diesel: "Diesel",
  armani: "Armani",
  mizuno: "Mizuno",
  newbalance: "New Balance",
  oskle: "Osklen",
  calvin: "Calvin Klein",
  clavin: "Calvin Klein",
  chinelo: "Genérico",
};

const formatProductName = (filename: string): string =>
  filename
    .replace(/\.(jpg|jpeg|png|webp)$/i, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\d+/g, "")
    .trim();

const generateSlug = (text: string): string =>
  slugify(text, { lower: true, strict: true });

async function generateUniqueSlug(
  model: "product" | "brand",
  name: string
): Promise<string> {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const exists =
      model === "product"
        ? await prisma.product.findUnique({ where: { slug }, select: { id: true } })
        : await prisma.brand.findUnique({ where: { slug }, select: { id: true } });

    if (!exists) break;

    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
}

const detectBrand = (filename: string): string => {
  const normalizedName = filename.toLowerCase();
  const matchedKey = Object.keys(BRAND_ALIASES).find((key) =>
    normalizedName.startsWith(key)
  );
  return matchedKey ? BRAND_ALIASES[matchedKey] : "Outros";
};

const detectGender = (filename: string): Gender => {
  const normalizedName = filename.toLowerCase();
  if (normalizedName.includes("kids") || normalizedName.includes("infantil")) return Gender.KIDS;
  if (normalizedName.includes("vans") || normalizedName.includes("oskle")) return Gender.FEMININO;
  return Gender.MASCULINO;
};

const detectCategory = (filename: string): Category => {
  const normalizedName = filename.toLowerCase();
  if (normalizedName.includes("social") || normalizedName.includes("couro")) return Category.SOCIAL;
  if (["air", "zoom", "runner", "pro"].some((kw) => normalizedName.includes(kw))) return Category.ESPORTIVO;
  return Category.CASUAL;
};

const generateRandomPrice = (): Prisma.Decimal => {
  const price = (Math.random() * (PRICE_MAX - PRICE_MIN) + PRICE_MIN).toFixed(2);
  return new Prisma.Decimal(price);
};

const getImagesRecursively = (dir: string, fileList: string[] = []): string[] => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getImagesRecursively(filePath, fileList);
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(filePath)) {
      fileList.push(filePath);
    }
  }

  return fileList;
};

async function main() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    throw new Error(`Directory not found: ${PUBLIC_DIR}`);
  }

  const imageFiles = getImagesRecursively(PUBLIC_DIR);

  if (imageFiles.length === 0) {
    return;
  }

  // Alterado: O ID agora é do tipo String (UUID)
  const brandsCache = new Map<string, string>();
  const existingBrands = await prisma.brand.findMany({ select: { id: true, name: true } });
  
  for (const brand of existingBrands) {
    brandsCache.set(brand.name, brand.id);
  }

  for (const absolutePath of imageFiles) {
    const fileName = path.basename(absolutePath);
    const imagePath = absolutePath.replace(PUBLIC_DIR, "").replace(/\\/g, "/");

    const productName = formatProductName(fileName);
    const brandName = detectBrand(fileName);
    const gender = detectGender(fileName);
    const category = detectCategory(fileName);

    let brandId = brandsCache.get(brandName);

    if (!brandId) {
      const brandSlug = await generateUniqueSlug("brand", brandName);
      const newBrand = await prisma.brand.create({
        data: { name: brandName, slug: brandSlug },
      });
      brandId = newBrand.id;
      brandsCache.set(brandName, brandId);
    }

    let product = await prisma.product.findFirst({
      where: { name: productName },
      include: { images: true },
    });

    if (!product) {
      const productSlug = await generateUniqueSlug("product", productName);
      
      const sizesData = Array.from({ length: SIZE_COUNT }, (_, i) => ({
        size: SIZE_START + i,
        stock: Math.floor(Math.random() * 15) + 5,
      }));

      product = await prisma.product.create({
        data: {
          name: productName,
          slug: productSlug,
          description: `${productName} - conforto, estilo e qualidade premium.`,
          price: generateRandomPrice(),
          gender,
          category,
          brandId,
          sizes: {
            createMany: {
              data: sizesData,
            },
          },
        },
        include: { images: true },
      });
    }

    const imageExists = product.images.some((img) => img.imagePath === imagePath);

    if (!imageExists) {
      await prisma.productImage.create({
        data: {
          imagePath,
          productId: product.id,
          order: product.images.length,
        },
      });
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });