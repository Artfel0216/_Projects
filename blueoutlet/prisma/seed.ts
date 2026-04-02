import { PrismaClient, Gender, Category, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import slugify from "slugify";
import fs from "fs";
import path from "path";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

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

const normalizeProductName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\b(preto|branco|white|black|azul|blue|vermelho|red|rosa|pink)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const formatProductName = (filename: string): string => {
  return filename
    .replace(/\.(jpg|jpeg|png|webp)$/i, "")
    .replace(/[-_]\d+$/, "")
    .replace(/[-_]/g, " ")
    .trim();
};

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
        ? await prisma.product.findUnique({ where: { slug } })
        : await prisma.brand.findUnique({ where: { slug } });

    if (!exists) break;

    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
}

const detectBrand = (filename: string): string => {
  const normalizedName = filename.toLowerCase();
  const matched = Object.entries(BRAND_ALIASES).find(([key]) =>
    normalizedName.includes(key)
  );
  return matched ? matched[1] : "Outros";
};

const detectGender = (filename: string): Gender => {
  const normalizedName = filename.toLowerCase();
  
  if (["kids", "infantil", "menino", "menina", "baby"].some(k => normalizedName.includes(k))) return Gender.KIDS;
  if (["mulher", "fem", "wmns", "rosa"].some(k => normalizedName.includes(k))) return Gender.FEMININO;
  
  return Gender.MASCULINO;
};

const detectCategory = (filename: string): Category => {
  const normalizedName = filename.toLowerCase();
  
  if (["social", "couro", "oxford", "mocassim"].some(k => normalizedName.includes(k))) return Category.SOCIAL;
  if (["air", "zoom", "runner", "sport", "corrida"].some(k => normalizedName.includes(k))) return Category.ESPORTIVO;
  
  return Category.CASUAL;
};

const generateRandomPrice = (): Prisma.Decimal => {
  const price = (Math.random() * (PRICE_MAX - PRICE_MIN) + PRICE_MIN).toFixed(2);
  return new Prisma.Decimal(price);
};

const getImagesRecursively = (dir: string, fileList: string[] = []): string[] => {
  for (const file of fs.readdirSync(dir)) {
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

  if (!imageFiles.length) {
    console.log("Nenhuma imagem encontrada.");
    return;
  }

  const brandsCache = new Map<string, string>();
  const productCache = new Map<string, any>();

  const existingBrands = await prisma.brand.findMany();
  existingBrands.forEach(b => brandsCache.set(b.name, b.id));

  for (const absolutePath of imageFiles) {
    const fileName = path.basename(absolutePath);
    const imagePath = absolutePath.replace(PUBLIC_DIR, "").replace(/\\/g, "/");

    const rawName = formatProductName(fileName);
    const baseName = normalizeProductName(rawName);

    const brandName = detectBrand(fileName);
    const gender = detectGender(fileName);
    const category = detectCategory(fileName);

    let brandId = brandsCache.get(brandName);

    if (!brandId) {
      const slug = await generateUniqueSlug("brand", brandName);
      const brand = await prisma.brand.create({
        data: { name: brandName, slug },
      });
      brandId = brand.id;
      brandsCache.set(brandName, brandId);
    }

    let product = productCache.get(baseName);

    if (!product) {
      product = await prisma.product.findFirst({
        where: {
          name: {
            contains: baseName,
            mode: "insensitive",
          },
        },
        include: { images: true },
      });

      if (!product) {
        const slug = await generateUniqueSlug("product", baseName);

        product = await prisma.product.create({
          data: {
            name: baseName,
            slug,
            description: `${baseName} - conforto, estilo e qualidade premium.`,
            price: generateRandomPrice(),
            gender,
            category,
            brandId,
            sizes: {
              createMany: {
                data: Array.from({ length: SIZE_COUNT }, (_, i) => ({
                  size: SIZE_START + i,
                  stock: Math.floor(Math.random() * 15) + 5,
                })),
              },
            },
          },
          include: { images: true },
        });
      }

      productCache.set(baseName, product);
    }

    const exists = product.images.some((img: any) => img.imagePath === imagePath);

    if (!exists) {
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

  console.log("✅ Seed otimizada concluída!");
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });