import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import logger from "./logger";

export const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

export const connectDB = async () => {
  try {
    console.log("⏳ Connecting to database...");
    await prisma.$connect();
    logger.info("🟢 DB Connected via Prisma");
    console.log("🟢 DB Connected via Prisma");
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const fullError = error instanceof Error ? error.stack : String(error);
    logger.error(`🔴 DB connection error: ${message}`);
    console.error(`🔴 DB connection error: ${message}`);
    console.error("Full error:", fullError);
    throw new Error(`Database connection failed: ${message}`);
  }
};

export const disconnectDB = async () => {
  await prisma.$disconnect();
};

// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: Number(process.env.DB_PORT), // default PostgreSQL port
// });

// pool.connect()
//   .then(() => {
//     console.log("🟢 Connected to PostgreSQL");
//   })
//   .catch((err) => {
//     console.error("🔴 PostgreSQL connection error:", err);
//   });

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// pool.connect()
//   .then(() => {
//     console.log("🟢 Connected to PostgreSQL");
//   })
//   .catch((err) => {
//     console.error("🔴 PostgreSQL connection error:", err);
//   });
