import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config(); // fallback to .env if present

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import { STANDARD_CHECKLIST, calculateSafetyScore } from "../src/lib/safety";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@wits.ac.za" },
    update: {},
    create: {
      role: "UNIVERSITY_ADMIN",
      name: "Thandiwe",
      surname: "Mokoena",
      email: "admin@wits.ac.za",
      passwordHash: password,
    },
  });

  const landlord = await prisma.user.upsert({
    where: { email: "landlord@example.com" },
    update: {
      onboardingCompleted: true,
      onboardingStep: 3,
    },
    create: {
      role: "LANDLORD",
      name: "Sipho",
      surname: "Dlamini",
      email: "landlord@example.com",
      phone: "+27 82 555 0192",
      idNumber: "8504125192083",
      passwordHash: password,
      onboardingCompleted: true,
      onboardingStep: 3,
      landlordProfile: {
        create: {
          entityType: "INDIVIDUAL",
        },
      },
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {
      onboardingCompleted: true,
      onboardingStep: 3,
    },
    create: {
      role: "STUDENT",
      name: "Lerato",
      surname: "Nkosi",
      email: "student@example.com",
      universityEmail: "lerato.nkosi@wits.ac.za",
      emailVerifiedAt: new Date(),
      passwordHash: password,
      onboardingCompleted: true,
      onboardingStep: 3,
      studentProfile: {
        create: {
          gender: "Female",
          nationality: "South African",
          isEnrolled: true,
          universityName: "University of the Witwatersrand (Wits)",
          studentNumber: "2489102",
          degreeProgram: "BSc Computer Science",
          yearOfStudy: "2nd Year Undergraduate",
          fundingType: "NSFAS",
          funderName: "NSFAS",
          funderReference: "NSFAS-2026-89102",
          monthlyAllowance: 4500,
          householdIncomeBracket: "R0 - R350,000 (NSFAS Eligible)",
        },
      },
    },
  });

  const property = await prisma.property.upsert({
    where: { id: "seed-property-1" },
    update: {},
    create: {
      id: "seed-property-1",
      title: "Braamfontein Student Loft",
      address: "12 Juta Street",
      suburb: "Braamfontein",
      city: "Johannesburg",
      priceMonthly: 5500,
      bedrooms: 1,
      distanceToCampus: 0.8,
      landlordId: landlord.id,
      status: "VERIFIED",
      checklistItems: {
        create: STANDARD_CHECKLIST.map((item) => ({
          category: item.category,
          label: item.label,
          weight: item.weight,
          passed: true,
        })),
      },
    },
    include: { checklistItems: true },
  });

  const safetyScore = calculateSafetyScore(property.checklistItems);
  await prisma.property.update({ where: { id: property.id }, data: { safetyScore } });

  const tenancy = await prisma.tenancy.upsert({
    where: { id: "seed-tenancy-1" },
    update: {},
    create: {
      id: "seed-tenancy-1",
      studentId: student.id,
      propertyId: property.id,
      startDate: new Date(),
      status: "ACTIVE",
    },
  });

  console.log({ admin: admin.email, landlord: landlord.email, student: student.email, tenancy: tenancy.id });
  console.log("All seeded accounts use the password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
