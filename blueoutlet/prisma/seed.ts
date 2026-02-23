import { PrismaClient, Gender, Category, Prisma } from "@prisma/client";
import slugify from "slugify";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const PUBLIC_DIR = path.join(process.cwd(), "public");

//////////////////////////////////////////////////
// HELPERS
//////////////////////////////////////////////////

const formatProductName = (filename: string): string =>
  filename
    .replace(/\.(jpg|jpeg|png)$/i, "")
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
        ? await prisma.product.findUnique({ where: { slug } })
        : await prisma.brand.findUnique({ where: { slug } });

    if (!exists) break;

    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
}

const detectBrand = (filename: string): string => {
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
  if (name.startsWith("calvin") || name.startsWith("clavin"))
    return "Calvin Klein";
  if (name.startsWith("chinelo")) return "Genérico";

  return "Outros";
};

const detectGender = (filename: string): Gender => {
  const name = filename.toLowerCase();

  if (name.includes("kids") || name.includes("infantil"))
    return Gender.KIDS;

  if (name.includes("vans") || name.includes("oskle"))
    return Gender.FEMININO;

  return Gender.MASCULINO;
};

const detectCategory = (filename: string): Category => {
  const name = filename.toLowerCase();

  if (name.includes("social") || name.includes("couro"))
    return Category.SOCIAL;

  if (
    name.includes("air") ||
    name.includes("zoom") ||
    name.includes("runner") ||
    name.includes("pro")
  )
    return Category.ESPORTIVO;

  return Category.CASUAL;
};

const randomPrice = (min = 199, max = 899): number =>
  Number((Math.random() * (max - min) + min).toFixed(2));

//////////////////////////////////////////////////
// MAIN
//////////////////////////////////////////////////

async function main() {
  console.log("🌱 Iniciando seed profissional...");

  if (!fs.existsSync(PUBLIC_DIR)) {
    throw new Error("❌ Pasta public não encontrada.");
  }

  const files = fs
    .readdirSync(PUBLIC_DIR)
    .filter((file) => /\.(jpg|jpeg|png)$/i.test(file));

  // CORREÇÃO 1: Alterado de { id: string } para { id: number }
  const brandsCache = new Map<string, { id: number }>();

  for (const file of files) {
    const productName = formatProductName(file);
    const brandName = detectBrand(file);
    const gender = detectGender(file);
    const category = detectCategory(file);

    //////////////////////////////////////////////////
    // BRAND (Otimizado com Cache)
    //////////////////////////////////////////////////

    let brandId = brandsCache.get(brandName)?.id;

    if (!brandId) {
      let brand = await prisma.brand.findUnique({ where: { name: brandName } });

      if (!brand) {
        const brandSlug = await generateUniqueSlug("brand", brandName);
        brand = await prisma.brand.create({
          data: { name: brandName, slug: brandSlug },
        });
      }

      brandId = brand.id;
      brandsCache.set(brandName, { id: brand.id });
    }

    //////////////////////////////////////////////////
    // PRODUCT (Idempotente)
    //////////////////////////////////////////////////

    let product = await prisma.product.findFirst({
      where: { name: productName },
      include: { images: true },
    });

    if (!product) {
      const productSlug = await generateUniqueSlug("product", productName);

      product = await prisma.product.create({
        data: {
          name: productName,
          slug: productSlug,
          description: `${productName} - conforto, estilo e qualidade premium.`,
          
          // CORREÇÃO 2: Embrulhado em Prisma.Decimal
          price: new Prisma.Decimal(randomPrice()), 
          
          gender,
          category,
          
          // CORREÇÃO 3: Adicionado "!" para garantir ao TS que a variável tem um valor numérico aqui
          brandId: brandId!, 
          
          sizes: {
            createMany: {
              data: Array.from({ length: 9 }, (_, i) => ({
                size: 35 + i,
                stock: Math.floor(Math.random() * 15) + 5,
              })),
            },
          },
        },
        include: { images: true },
      });

      console.log(`🆕 Produto criado: ${productName}`);
    } else {
      console.log(`⏭️ Produto já existente: ${productName}`);
    }

    //////////////////////////////////////////////////
    // IMAGE
    //////////////////////////////////////////////////

    const imagePath = `/${file}`;

    // CORREÇÃO 4: Uso do "!" no product para silenciar o aviso "possibly null" do TS
    const imageExists = product!.images.some(
      (img) => img.imagePath === imagePath
    );

    if (!imageExists) {
      await prisma.productImage.create({
        data: {
          imagePath,
          productId: product!.id,
          order: product!.images.length,
        },
      });

      console.log(`📸 Imagem adicionada: ${file}`);
    } else {
      console.log(`⏭️ Imagem já existente: ${file}`);
    }
  }

  console.log("✅ Seed finalizado com sucesso!");
}

main()
  .catch((error) => {
    console.error("❌ Erro no seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });