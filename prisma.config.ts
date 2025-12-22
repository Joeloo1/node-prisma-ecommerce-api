import { defineConfig, env } from "prisma/config";
import { PrismaClient } from "@prisma/client";
// import postgresql from "pg"

export default defineConfig({
  schema: "prisma/schema.prisma",
  // migrations: {
  //   path: "prisma/migrations",
  // },
  datasource: {
    url: "postgresql://postgres:Slimmy_jay02@db.tfbywmfbjgqvwgyyldbt.supabase.co:5432/postgres",
  },
});

export const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});
