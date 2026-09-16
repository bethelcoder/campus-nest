import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Migrations need a direct (non-pooled) connection — DIRECT_DATABASE_URL,
    // not DATABASE_URL. DATABASE_URL (pooled) is still used at runtime by the
    // Neon adapter in src/lib/prisma.ts — that file doesn't change.
    url: env("DATABASE_URL"),
  },
});