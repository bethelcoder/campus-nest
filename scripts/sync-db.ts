import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in .env or .env.local");
  }

  const adapter = new PrismaNeon({ connectionString });
  const prisma = new PrismaClient({ adapter });

  console.log("Connecting to Neon PostgreSQL...");

  // 1. User table updates
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
  `).catch(e => console.log("Note passwordHash:", e.message));

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firebaseUid" TEXT;
  `).catch(e => console.log("Note firebaseUid column:", e.message));

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "User_firebaseUid_key" ON "User"("firebaseUid");
  `).catch(e => console.log("Note firebaseUid index:", e.message));

  // 2. StudentProfile table updates
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "idDocumentUrl" TEXT;
  `).catch(e => console.log("Note idDocumentUrl:", e.message));

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "idDocumentName" TEXT;
  `).catch(e => console.log("Note idDocumentName:", e.message));

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "idDocumentCertified" BOOLEAN DEFAULT false;
  `).catch(e => console.log("Note idDocumentCertified:", e.message));

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "idCertificationDate" TIMESTAMP(3);
  `).catch(e => console.log("Note idCertificationDate:", e.message));

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "monthlyBudget" DECIMAL(65,30);
  `).catch(e => console.log("Note monthlyBudget:", e.message));

  console.log("✅ Schema sync completed successfully!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Migration error:", e);
  process.exit(1);
});
