import { PrismaClient, Gender, Category, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import slugify from "slugify";
import fs from "fs/promises";
import path from "path";
import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PUBLIC_DIR = path.join(process.cwd(), "public");
const PRICE_MIN = 199.9;
const PRICE_MAX = 899.9;
const SIZE_START = 35;
const SIZE_COUNT = 9;

const BRAND_MAP: Record<string, string> = {
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
  vans: "Vans",
};

const normalizeProductName = (name: string): string => {
  let cleanName = name
    .replace(/\.(jpg|jpeg|png|webp)$/i, "")
    .replace(/[-_]/g, " ");

  // Força espaço em palavras coladas comuns
  const commonTerms = ["tenis", "nike", "adidas", "vans", "mizuno", "air", "force", "jordan", "shox", "prophecy"];
  commonTerms.forEach(term => {
    const regex = new RegExp(`(${term})`, "gi");
    cleanName = cleanName.replace(regex, " $1 ");
  });

  cleanName = cleanName
    .replace(/\b(preto|branco|white|black|azul|blue|vermelho|red|rosa|pink|verde|green)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleanName.split(' ').map(word => 
    word.length > 2 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()
  ).join(' ');
};

const getBaseProductName = (name: string): string => {
  return name.replace(/\s?\d+$/, "").trim().toLowerCase();
};

const generateSlug = (text: string): string =>
  slugify(text, { lower: true, strict: true });

async function generateUniqueSlug(model: "product" | "brand", name: string): Promise<string> {
  const baseSlug = generateSlug(name);
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const exists = await (prisma[model] as any).findUnique({ where: { slug } });
    if (!exists) break;
    slug = `${baseSlug}-${counter++}`;
  }
  return slug;
}

const detectBrand = (filename: string): string => {
  const lower = filename.toLowerCase();
  for (const [key, value] of Object.entries(BRAND_MAP)) {
    if (lower.includes(key)) return value;
  }
  return "Outros";
};

const detectGender = (filename: string): Gender => {
  const lower = filename.toLowerCase();
  if (/kids|infantil|menino|menina|baby/.test(lower)) return Gender.KIDS;
  if (/mulher|fem|wmns|feminino/.test(lower)) return Gender.FEMININO;
  return Gender.MASCULINO;
};

const detectCategory = (filename: string): Category => {
  const lower = filename.toLowerCase();
  if (/social|couro|oxford|mocassim/.test(lower)) return Category.SOCIAL;
  if (/air|zoom|runner|sport|corrida|esportivo|chuteira/.test(lower)) return Category.ESPORTIVO;
  return Category.CASUAL;
};

const generateRandomPrice = (): Prisma.Decimal => {
  const price = Math.random() * (PRICE_MAX - PRICE_MIN) + PRICE_MIN;
  return new Prisma.Decimal(price.toFixed(2));
};

async function getImagesRecursively(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((res) => {
    const resPath = path.resolve(dir, res.name);
    return res.isDirectory() ? getImagesRecursively(resPath) : resPath;
  }));
  return files.flat().filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
}

async function main() {
  const imageFiles = await getImagesRecursively(PUBLIC_DIR);
  if (!imageFiles.length) return;

  const [existingBrands, existingProducts] = await Promise.all([
    prisma.brand.findMany(),
    prisma.product.findMany({ include: { images: true } })
  ]);

  const brandsCache = new Map(existingBrands.map(b => [b.name, b.id]));
  const productCache = new Map(existingProducts.map(p => [p.name.toLowerCase(), p]));

  for (const absolutePath of imageFiles) {
    const fileName = path.basename(absolutePath);
    const imagePath = absolutePath.replace(PUBLIC_DIR, "").replace(/\\/g, "/");

    const brandName = detectBrand(fileName);
    const gender = detectGender(fileName);
    const category = detectCategory(fileName);
    
    const fullName = normalizeProductName(fileName);
    const baseSearchName = getBaseProductName(fullName);

    let brandId = brandsCache.get(brandName);
    if (!brandId) {
      const slug = await generateUniqueSlug("brand", brandName);
      const brand = await prisma.brand.create({ data: { name: brandName, slug } });
      brandId = brand.id;
      brandsCache.set(brandName, brandId);
    }

    let product = productCache.get(baseSearchName);

    if (!product) {
      const slug = await generateUniqueSlug("product", fullName);
      product = await prisma.product.create({
        data: {
          name: fullName,
          slug,
          description: `${fullName} - Alta performance, conforto e estilo premium.`,
          price: generateRandomPrice(),
          gender,
          category,
          brandId,
          sizes: {
            createMany: {
              data: Array.from({ length: SIZE_COUNT }, (_, i) => ({
                size: SIZE_START + i,
                stock: Math.floor(Math.random() * 20) + 5,
              })),
            },
          },
        },
        include: { images: true },
      });
      productCache.set(baseSearchName, product);
    }

    const hasImage = product.images.some(img => img.imagePath === imagePath);
    if (!hasImage) {
      const newImage = await prisma.productImage.create({
        data: {
          imagePath,
          productId: product.id,
          order: product.images.length,
        },
      });
      product.images.push(newImage);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });