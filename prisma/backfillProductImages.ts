import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function picsum(seed: string, w: number, h: number) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

function productSeed(p: { product_id: string; name: string | null }) {
  const base = (p.name ?? "product")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
  return `${base}-${p.product_id.slice(0, 8)}`;
}

async function main() {
  const target = Number(process.env.PRODUCT_MIN_IMAGES ?? "5");
  if (!Number.isFinite(target) || target < 2) {
    throw new Error("PRODUCT_MIN_IMAGES must be a number >= 2");
  }

  const products = await prisma.products.findMany({
    select: {
      product_id: true,
      name: true,
      image: true,
      // Prisma client types might lag behind schema in some environments, so keep this flexible.
      ...( { images: true } as any ),
    } as any,
  });

  let updated = 0;

  for (const p of products as any[]) {
    const existing: string[] = Array.isArray(p.images) ? p.images : [];
    const baseSeed = productSeed(p);

    const need = Math.max(0, target - existing.length);
    if (need === 0) continue;

    const add = Array.from({ length: need }, (_, i) =>
      picsum(`${baseSeed}-extra-${existing.length + i + 1}`, 1200, 900),
    );

    const nextImages = [...existing, ...add];
    const nextPrimary = p.image ?? nextImages[0] ?? null;

    await prisma.products.update({
      where: { product_id: p.product_id },
      data: {
        ...( { images: nextImages } as any ),
        image: nextPrimary,
      } as any,
    });

    updated++;
  }

  console.log(
    `Backfill complete. Updated ${updated}/${products.length} products to have >= ${target} images.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

