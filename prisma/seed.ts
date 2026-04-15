import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const CATEGORY_NAMES = [
  "Electronics",
  "Home & Kitchen",
  "Fashion",
  "Sports & Outdoors",
  "Beauty",
  "Books & Media",
  "Toys & Games",
  "Garden & Tools",
  "Office",
  "Groceries & Pantry",
] as const;

type CatName = (typeof CATEGORY_NAMES)[number];

const PRODUCT_BLUEPRINTS: Record<
  CatName,
  Array<{ name: string; brand: string; unit: string; basePrice: number; discount?: number }>
> = {
  Electronics: [
    { name: "Wireless noise-cancelling headphones", brand: "Aurora Audio", unit: "each", basePrice: 249.99, discount: 10 },
    { name: "USB-C fast charger 65W", brand: "VoltaCore", unit: "each", basePrice: 45.0 },
    { name: "Mechanical keyboard — tactile", brand: "KeyForge", unit: "each", basePrice: 129.0, discount: 15 },
    { name: "4K webcam with privacy shutter", brand: "ClearView", unit: "each", basePrice: 89.99 },
    { name: "Portable SSD 1TB", brand: "SwiftDrive", unit: "each", basePrice: 119.0 },
    { name: "Smart watch — fitness edition", brand: "PulseWear", unit: "each", basePrice: 199.0, discount: 20 },
    { name: "Bluetooth speaker waterproof", brand: "WaveBox", unit: "each", basePrice: 79.5 },
    { name: "Laptop stand aluminum", brand: "ErgoLift", unit: "each", basePrice: 54.0 },
    { name: "Wireless mouse ergonomic", brand: "GlidePoint", unit: "each", basePrice: 39.99 },
    { name: "HDMI 2.1 cable 2m", brand: "LinkPro", unit: "each", basePrice: 24.0 },
    { name: "Tablet 11-inch 128GB", brand: "NexTab", unit: "each", basePrice: 429.0 },
    { name: "Phone case — MagSafe clear", brand: "ShellGuard", unit: "each", basePrice: 29.0 },
  ],
  "Home & Kitchen": [
    { name: "Stainless steel cookware set (10pc)", brand: "ChefStone", unit: "set", basePrice: 189.0, discount: 12 },
    { name: "Glass food storage containers (12pc)", brand: "FreshLock", unit: "set", basePrice: 42.0 },
    { name: "Electric kettle 1.7L", brand: "RapidBoil", unit: "each", basePrice: 49.99 },
    { name: "Non-stick frying pan 28cm", brand: "SkilletPro", unit: "each", basePrice: 36.0 },
    { name: "Dish rack over-sink", brand: "DryDock", unit: "each", basePrice: 55.0 },
    { name: "Cotton bath towel set (4pc)", brand: "SoftWeave", unit: "set", basePrice: 48.0 },
    { name: "LED desk lamp dimmable", brand: "LumaBeam", unit: "each", basePrice: 34.0 },
    { name: "Air fryer 5.5L digital", brand: "CrispAir", unit: "each", basePrice: 119.0, discount: 8 },
    { name: "Vacuum-insulated water bottle 750ml", brand: "HydroPeak", unit: "each", basePrice: 32.0 },
    { name: "Bamboo cutting board large", brand: "GreenEdge", unit: "each", basePrice: 28.0 },
  ],
  Fashion: [
    { name: "Organic cotton crewneck tee", brand: "NorthThread", unit: "each", basePrice: 28.0 },
    { name: "Slim-fit chino pants", brand: "UrbanLine", unit: "each", basePrice: 64.0, discount: 10 },
    { name: "Wool blend winter coat", brand: "FrostLine", unit: "each", basePrice: 189.0 },
    { name: "Leather belt reversible", brand: "BuckleCo", unit: "each", basePrice: 45.0 },
    { name: "Running sneakers — cushioned", brand: "StrideMax", unit: "pair", basePrice: 98.0 },
    { name: "Canvas tote bag", brand: "CarryAll", unit: "each", basePrice: 22.0 },
    { name: "Merino wool socks (3 pairs)", brand: "WarmStep", unit: "pack", basePrice: 24.0 },
    { name: "Polarized sunglasses", brand: "SunShield", unit: "each", basePrice: 72.0 },
    { name: "Denim jacket classic fit", brand: "BlueRidge", unit: "each", basePrice: 79.0 },
    { name: "Cashmere scarf", brand: "SoftHaven", unit: "each", basePrice: 56.0, discount: 15 },
  ],
  "Sports & Outdoors": [
    { name: "Yoga mat non-slip 6mm", brand: "ZenFlow", unit: "each", basePrice: 38.0 },
    { name: "Resistance bands set (5)", brand: "FlexTrain", unit: "set", basePrice: 29.99 },
    { name: "Insulated hiking backpack 40L", brand: "TrailPeak", unit: "each", basePrice: 95.0 },
    { name: "Cycling helmet MIPS", brand: "SafeRide", unit: "each", basePrice: 84.0 },
    { name: "Foam roller 33cm", brand: "RecoverPro", unit: "each", basePrice: 26.0 },
    { name: "Camping lantern rechargeable", brand: "NightGlow", unit: "each", basePrice: 44.0 },
    { name: "Jump rope speed cable", brand: "CardioSnap", unit: "each", basePrice: 18.0 },
    { name: "Tennis racket graphite", brand: "CourtEdge", unit: "each", basePrice: 112.0, discount: 5 },
    { name: "Hydration pack 2L", brand: "FlowTrail", unit: "each", basePrice: 58.0 },
    { name: "Foldable camping chair", brand: "SitAnywhere", unit: "each", basePrice: 49.0 },
  ],
  Beauty: [
    { name: "Daily moisturizer SPF 30", brand: "GlowLab", unit: "each", basePrice: 32.0 },
    { name: "Vitamin C serum 30ml", brand: "RadiantSkin", unit: "each", basePrice: 42.0, discount: 10 },
    { name: "Gentle facial cleanser", brand: "PureFoam", unit: "each", basePrice: 19.0 },
    { name: "Argan oil hair mask", brand: "SilkStrand", unit: "each", basePrice: 24.0 },
    { name: "Matte lipstick set (3)", brand: "ColorHue", unit: "set", basePrice: 36.0 },
    { name: "Beard oil sandalwood", brand: "RoughGent", unit: "each", basePrice: 22.0 },
    { name: "Sunscreen lotion 100ml", brand: "SunGuard", unit: "each", basePrice: 16.0 },
    { name: "Electric toothbrush heads (4)", brand: "BrightSmile", unit: "pack", basePrice: 28.0 },
  ],
  "Books & Media": [
    { name: "Hardcover — Modern Web APIs", brand: "TechPress", unit: "each", basePrice: 44.0 },
    { name: "Cookbook: Weeknight dinners", brand: "KitchenTales", unit: "each", basePrice: 29.0 },
    { name: "Sci-fi novel — deep space", brand: "Starbound", unit: "each", basePrice: 18.99 },
    { name: "Vinyl record — jazz classics", brand: "GrooveWorks", unit: "each", basePrice: 34.0 },
    { name: "Children’s illustrated atlas", brand: "TinyExplorer", unit: "each", basePrice: 22.0 },
    { name: "Mystery thriller paperback", brand: "PageTurner", unit: "each", basePrice: 14.0, discount: 20 },
  ],
  "Toys & Games": [
    { name: "Building bricks — castle kit", brand: "BrickWorld", unit: "each", basePrice: 59.0 },
    { name: "Board game — strategy 2–4 players", brand: "TableTop Co", unit: "each", basePrice: 42.0 },
    { name: "RC car 1:16 scale", brand: "TurboToy", unit: "each", basePrice: 48.0, discount: 12 },
    { name: "Plush teddy bear large", brand: "HugBuddy", unit: "each", basePrice: 35.0 },
    { name: "Puzzle 1000 pieces — landscape", brand: "PiecePeace", unit: "each", basePrice: 24.0 },
    { name: "Card game family edition", brand: "LaughDeck", unit: "each", basePrice: 16.0 },
  ],
  "Garden & Tools": [
    { name: "Cordless drill 18V kit", brand: "TorqueMax", unit: "each", basePrice: 129.0 },
    { name: "Garden hose 15m expandable", brand: "AquaFlex", unit: "each", basePrice: 38.0 },
    { name: "Pruning shears ergonomic", brand: "GreenCut", unit: "each", basePrice: 26.0 },
    { name: "LED grow light full spectrum", brand: "PlantGlow", unit: "each", basePrice: 54.0 },
    { name: "Compost bin 80L", brand: "EarthCycle", unit: "each", basePrice: 67.0 },
    { name: "Tape measure laser 40m", brand: "ExactLine", unit: "each", basePrice: 44.0, discount: 8 },
  ],
  Office: [
    { name: "Notebook A5 dotted (3-pack)", brand: "InkWell", unit: "pack", basePrice: 18.0 },
    { name: "Ergonomic office chair mesh", brand: "SitRight", unit: "each", basePrice: 279.0, discount: 10 },
    { name: "Whiteboard magnetic 90×60cm", brand: "IdeaWall", unit: "each", basePrice: 72.0 },
    { name: "Desk organizer bamboo", brand: "TidySpace", unit: "each", basePrice: 31.0 },
    { name: "Gel pens assorted (12)", brand: "SmoothWrite", unit: "pack", basePrice: 12.0 },
    { name: "Monitor arm single gas spring", brand: "ViewMount", unit: "each", basePrice: 89.0 },
  ],
  "Groceries & Pantry": [
    { name: "Extra virgin olive oil 750ml", brand: "Mediterra", unit: "bottle", basePrice: 14.0 },
    { name: "Arabica coffee beans 1kg", brand: "MorningRoast", unit: "bag", basePrice: 28.0, discount: 5 },
    { name: "Organic rolled oats 1kg", brand: "FieldHarvest", unit: "bag", basePrice: 6.5 },
    { name: "Dark chocolate 85% 100g", brand: "CacaoPure", unit: "bar", basePrice: 4.5 },
    { name: "Green tea loose leaf 250g", brand: "ZenLeaf", unit: "tin", basePrice: 19.0 },
    { name: "Honey raw wildflower 500g", brand: "BeeHappy", unit: "jar", basePrice: 12.0 },
  ],
};

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function picsum(seed: string, w: number, h: number) {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}

function gallerySeeds(baseSeed: string, count: number) {
  return Array.from({ length: count }, (_, i) => `${baseSeed}-img-${i + 1}`);
}

async function clearCatalog() {
  console.log("Removing existing catalog data (orders, reviews, cart lines, products, categories)…");
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.products.deleteMany();
  await prisma.category.deleteMany();
  console.log("Catalog cleared.");
}

async function main() {
  const reset = process.env.SEED_RESET === "true" || process.env.SEED_RESET === "1";
  const existingProducts = await prisma.products.count();

  if (!reset && existingProducts > 0) {
    console.log(
      `Found ${existingProducts} products already. Skipping seed.\n` +
        "To replace everything, run: SEED_RESET=true npx prisma db seed",
    );
    return;
  }

  if (reset || existingProducts === 0) {
    if (reset && existingProducts > 0) {
      await clearCatalog();
    }
  }

  console.log("Seeding categories…");
  const categoryMap = new Map<string, number>();

  for (const name of CATEGORY_NAMES) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categoryMap.set(name, cat.category_id);
  }

  console.log("Seeding products…");
  let created = 0;

  for (const catName of CATEGORY_NAMES) {
    const category_id = categoryMap.get(catName)!;
    const blueprints = PRODUCT_BLUEPRINTS[catName];

    for (const bp of blueprints) {
      const seed = slug(`${catName}-${bp.brand}-${bp.name}`);
      const images = gallerySeeds(seed, 5).map((s) => picsum(s, 1200, 900));
      const image = images[0]!;
      const rating = Math.round((3.6 + Math.random() * 1.4) * 10) / 10;
      const description = `${bp.brand} — ${bp.name}. Quality pick in ${catName}. Ships from our demo catalog.`;

      // Backward compatible: Prisma client types won't include `images` until after migrate + generate.
      const data: any = {
        name: bp.name,
        description,
        price: Math.round(bp.basePrice * 100) / 100,
        unit: bp.unit,
        image,
        discount: bp.discount ?? null,
        availability: Math.random() > 0.05,
        brand: bp.brand,
        rating,
        category_id,
      };
      data.images = images;

      await prisma.products.create({
        data,
      });
      created++;
    }
  }

  console.log(`Done. Created ${created} products in ${CATEGORY_NAMES.length} categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
