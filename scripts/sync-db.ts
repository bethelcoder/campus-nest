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

  // 0. Enums
  console.log("Syncing Enums...");
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SRC_REPRESENTATIVE';
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `).catch(e => console.log("Note UserRole enum:", e.message));

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "TriageType" AS ENUM ('STANDARD_MAINTENANCE', 'RIGHTS_VIOLATION_CRISIS');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `).catch(e => console.log("Note TriageType enum:", e.message));

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      CREATE TYPE "TriageSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL_EMERGENCY');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `).catch(e => console.log("Note TriageSeverity enum:", e.message));

  // 1. User table updates
  console.log("Syncing User table...");
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;
  `).catch(e => console.log("Note passwordHash:", e.message));

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firebaseUid" TEXT;
  `).catch(e => console.log("Note firebaseUid column:", e.message));

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "institutionName" TEXT;
  `).catch(e => console.log("Note institutionName column:", e.message));

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastOtpSentAt" TIMESTAMP(3);
  `).catch(e => console.log("Note lastOtpSentAt:", e.message));

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;
  `).catch(e => console.log("Note onboardingCompleted:", e.message));

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingStep" INTEGER NOT NULL DEFAULT 1;
  `).catch(e => console.log("Note onboardingStep:", e.message));

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "User_firebaseUid_key" ON "User"("firebaseUid");
  `).catch(e => console.log("Note firebaseUid index:", e.message));

  // 2. StudentProfile table
  console.log("Syncing StudentProfile table...");
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "StudentProfile" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "dateOfBirth" TIMESTAMP(3),
      "gender" TEXT,
      "nationality" TEXT,
      "preferredLanguage" TEXT,
      "idDocumentUrl" TEXT,
      "idDocumentName" TEXT,
      "idDocumentCertified" BOOLEAN NOT NULL DEFAULT false,
      "idCertificationDate" TIMESTAMP(3),
      "emergencyContactName" TEXT,
      "emergencyContactPhone" TEXT,
      "emergencyContactRelationship" TEXT,
      "currentAddress" TEXT,
      "city" TEXT,
      "province" TEXT,
      "isEnrolled" BOOLEAN NOT NULL DEFAULT false,
      "universityName" TEXT,
      "studentNumber" TEXT,
      "degreeProgram" TEXT,
      "yearOfStudy" TEXT,
      "fundingType" TEXT,
      "funderName" TEXT,
      "funderReference" TEXT,
      "funderContactEmail" TEXT,
      "monthlyAllowance" DECIMAL(65,30),
      "monthlyBudget" DECIMAL(65,30),
      "householdIncomeBracket" TEXT,
      "guarantorName" TEXT,
      "guarantorPhone" TEXT,
      "guarantorRelationship" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("id")
    );
  `).catch(e => console.log("Note StudentProfile table:", e.message));

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "StudentProfile_userId_key" ON "StudentProfile"("userId");
  `).catch(e => console.log("Note StudentProfile_userId_key:", e.message));

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "idCertificationDate" TIMESTAMP(3);
  `).catch(e => console.log("Note idCertificationDate:", e.message));

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `).catch(e => console.log("Note StudentProfile fk:", e.message));

  // 3. LandlordProfile table
  console.log("Syncing LandlordProfile table...");
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "LandlordProfile" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "entityType" TEXT,
      "companyName" TEXT,
      "companyRegNumber" TEXT,
      "taxNumber" TEXT,
      "businessAddress" TEXT,
      "contactPhone" TEXT,
      "draftResidenceName" TEXT,
      "draftAddress" TEXT,
      "draftSuburb" TEXT,
      "draftCity" TEXT,
      "draftNearestUniversity" TEXT,
      "draftDistanceToCampus" DECIMAL(65,30),
      "draftBedrooms" INTEGER,
      "draftPriceMonthly" DECIMAL(65,30),
      "draftAmenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "LandlordProfile_pkey" PRIMARY KEY ("id")
    );
  `).catch(e => console.log("Note LandlordProfile table:", e.message));

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "LandlordProfile_userId_key" ON "LandlordProfile"("userId");
  `).catch(e => console.log("Note LandlordProfile_userId_key:", e.message));

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "LandlordProfile" ADD CONSTRAINT "LandlordProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `).catch(e => console.log("Note LandlordProfile fk:", e.message));

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "proofOfRegistrationName" TEXT;
  `).catch(e => console.log("Note proofOfRegistrationName:", e.message));

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "emergencyContact2Name" TEXT;
  `).catch(e => console.log("Note emergencyContact2Name:", e.message));

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "emergencyContact2Phone" TEXT;
  `).catch(e => console.log("Note emergencyContact2Phone:", e.message));

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "StudentProfile" ADD COLUMN IF NOT EXISTS "emergencyContact2Relationship" TEXT;
  `).catch(e => console.log("Note emergencyContact2Relationship:", e.message));

  // 4. Property table updates
  console.log("Syncing Property table...");
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "physicalInspectionAt" TIMESTAMP(3);
    ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "physicalInspectorName" TEXT;
    ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "accreditationReference" TEXT;
    ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "safetyScore" DECIMAL(65,30);
    ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "distanceToCampus" DECIMAL(65,30);
    ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "depositAmount" DECIMAL(65,30);
    ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
    ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
  `).catch(e => console.log("Note Property columns:", e.message));

  // 5. Tenancy table updates
  console.log("Syncing Tenancy table...");
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Tenancy" ADD COLUMN IF NOT EXISTS "roomName" TEXT;
    ALTER TABLE "Tenancy" ADD COLUMN IF NOT EXISTS "roomType" TEXT;
    ALTER TABLE "Tenancy" ADD COLUMN IF NOT EXISTS "monthlyRent" DECIMAL(65,30);
    ALTER TABLE "Tenancy" ADD COLUMN IF NOT EXISTS "deposit" DECIMAL(65,30);
  `).catch(e => console.log("Note Tenancy columns:", e.message));

  // 6. Check / create FunderLetterRequest table
  console.log("Syncing FunderLetterRequest table...");
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "FunderLetterRequest" (
      "id" TEXT NOT NULL,
      "applicationId" TEXT NOT NULL,
      "studentId" TEXT NOT NULL,
      "propertyId" TEXT NOT NULL,
      "funderEmail" TEXT,
      "status" "ConfirmationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
      "letterReference" TEXT NOT NULL,
      "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "physicalInspectionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "physicalInspectorName" TEXT NOT NULL DEFAULT 'Inspector',
      "accreditationReference" TEXT,
      "safetyScore" DECIMAL(65,30),
      "checklistPassed" INTEGER NOT NULL DEFAULT 0,
      "checklistTotal" INTEGER NOT NULL DEFAULT 0,
      "issuedAt" TIMESTAMP(3),

      CONSTRAINT "FunderLetterRequest_pkey" PRIMARY KEY ("id")
    );
  `).catch(e => console.log("Note FunderLetterRequest table:", e.message));

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "FunderLetterRequest_applicationId_key" ON "FunderLetterRequest"("applicationId");
  `).catch(e => console.log("Note FunderLetterRequest_applicationId_key:", e.message));

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "FunderLetterRequest_letterReference_key" ON "FunderLetterRequest"("letterReference");
  `).catch(e => console.log("Note FunderLetterRequest_letterReference_key:", e.message));

  // 7. SafetyReport table updates
  console.log("Syncing SafetyReport table...");
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "SafetyReport" ADD COLUMN IF NOT EXISTS "type" "TriageType" NOT NULL DEFAULT 'STANDARD_MAINTENANCE';
    ALTER TABLE "SafetyReport" ADD COLUMN IF NOT EXISTS "severity" "TriageSeverity" NOT NULL DEFAULT 'MEDIUM';
    ALTER TABLE "SafetyReport" ADD COLUMN IF NOT EXISTS "category" TEXT;
    ALTER TABLE "SafetyReport" ADD COLUMN IF NOT EXISTS "slaHours" INTEGER DEFAULT 48;
    ALTER TABLE "SafetyReport" ADD COLUMN IF NOT EXISTS "slaExpiresAt" TIMESTAMP(3);
    ALTER TABLE "SafetyReport" ADD COLUMN IF NOT EXISTS "resolvedAt" TIMESTAMP(3);
    ALTER TABLE "SafetyReport" ADD COLUMN IF NOT EXISTS "evidenceUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
    ALTER TABLE "SafetyReport" ADD COLUMN IF NOT EXISTS "actionNotes" TEXT;
  `).catch(e => console.log("Note SafetyReport columns:", e.message));

  console.log("✅ Schema sync completed successfully!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Migration error:", e);
  process.exit(1);
});
