import { PrismaClient } from "@prisma/client";
import slugify from "slugify";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const PUBLIC_DIR = path.join(process.cwd(), "public");

async function generateUniqueSlug(name: string) {
  const baseSlug = slugify(name, {
    lower: true,
    strict: true,
    trim: true,
  });

  let slug = baseSlug;
  let counter = 1;

  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

function formatProductName(filename: string) {
  return filename
    .replace(/\.(jpg|png|jpeg)$/i, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\d+/g, "")
    .trim();
}

function detectBrand(filename: string) {
  const name = filename.toLowerCase();

  if (name.startsWith("adidas")) return "Adidas";
  if (name.startsWith("nike")) return "Nike";
  if (name.startsWith("boss") || name.startsWith("hugoboss")) return "Boss";
  if (name.startsWith("gucci")) return "Gucci";
  if (name.startsWith("diesel")) return "Diesel";
  if (name.startsWith("armani")) return "Armani";
  if (name.startsWith("mizuno")) return "Mizuno";
  if (name.startsWith("newbalance")) return "New Balance";
  if (name.startsWith("oskle")) return "Osklen";
  if (name.startsWith("clavin") || name.startsWith("calvin"))
    return "Calvin Klein";
  if (name.startsWith("chinelo")) return "Genérico";

  return "Outros";
}

function randomPrice(min = 180, max = 699) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("🌱 Iniciando seed automático por imagens...");

  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error(`❌ Pasta não encontrada: ${PUBLIC_DIR}`);
    return;
  }

  const files = fs
    .readdirSync(PUBLIC_DIR)
    .filter((file) => /\.(jpg|jpeg|png)$/i.test(file));

  for (const file of files) {
    const name = formatProductName(file);
    const brandName = detectBrand(file);

    const brand = await prisma.brand.upsert({
      where: { name: brandName },
      update: {},
      create: { name: brandName },
    });

    const exists = await prisma.product.findFirst({
      where: { imagePath: `/${file}` },
    });

    if (exists) {
      console.log(`⏭️ Já existe: ${name}`);
      continue;
    }

    const slug = await generateUniqueSlug(name);

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: `${name} - conforto, estilo e qualidade premium.`,
        price: randomPrice(),
        imagePath: `/${file}`,
        category: "Calçados",
        gender: "masculino",
        brandId: brand.id,
      },
    });

    await prisma.productSize.createMany({
      data: Array.from({ length: 9 }, (_, i) => ({
        size: 35 + i,
        stock: Math.floor(Math.random() * 15) + 5,
        productId: product.id,
      })),
    });

    console.log(`✅ Produto criado com tamanhos 35–43: ${name}`);
  }

  console.log("🌱 Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });