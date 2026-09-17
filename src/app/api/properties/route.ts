import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { STANDARD_CHECKLIST, calculateSafetyScore } from "@/lib/safety";

// Public browsing — no auth required, per PRD ("Public browsing without
// login available for listings"). Only VERIFIED properties are shown to
// the public; a landlord's own DRAFT/PENDING listings are only visible to
// that landlord via the landlord dashboard (not implemented in this route).
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const minPrice = params.get("minPrice");
  const maxPrice = params.get("maxPrice");
  const minSafetyScore = params.get("minSafetyScore");
  const city = params.get("city");
  const q = params.get("q");

  const properties = await prisma.property.findMany({
    where: {
      status: "VERIFIED",
      ...(minPrice || maxPrice
        ? {
            priceMonthly: {
              ...(minPrice ? { gte: Number(minPrice) } : {}),
              ...(maxPrice ? { lte: Number(maxPrice) } : {}),
            },
          }
        : {}),
      ...(minSafetyScore ? { safetyScore: { gte: Number(minSafetyScore) } } : {}),
      ...(city ? { city: { equals: city, mode: "insensitive" } } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { suburb: { contains: q, mode: "insensitive" } },
              { address: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { safetyScore: "desc" },
    select: {
      id: true,
      title: true,
      suburb: true,
      city: true,
      priceMonthly: true,
      bedrooms: true,
      distanceToCampus: true,
      safetyScore: true,
      status: true,
      images: true,
    },
  });

  return NextResponse.json({ properties });
}

const createPropertySchema = z.object({
  title: z.string().min(1, "Residence title is required"),
  address: z.string().min(1, "Street address is required"),
  suburb: z.string().min(1, "Suburb is required"),
  city: z.string().min(1, "City is required"),
  priceMonthly: z.number().positive("Monthly price must be positive"),
  depositAmount: z.number().nonnegative().optional().nullable(),
  bedrooms: z.number().int().positive("Bedrooms must be at least 1"),
  bathrooms: z.number().int().positive().optional().nullable(),
  maxOccupants: z.number().int().positive().optional().nullable(),
  description: z.string().optional().nullable(),
  amenities: z.array(z.string()).default([]),
  distanceToCampus: z.number().nonnegative().optional().nullable(),
  images: z.array(z.string()).default([]),
  checklistAnswers: z.array(
    z.object({
      category: z.enum([
        "SECURITY",
        "FIRE_SAFETY",
        "UTILITIES",
        "BUILDING_STRUCTURE",
        "LOCATION_RISK",
      ]),
      label: z.string(),
      weight: z.number().int().default(1),
      passed: z.boolean().nullable(),
      notes: z.string().optional().nullable(),
    })
  ).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") {
    return NextResponse.json({ error: "Only landlords can create listings" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createPropertySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { checklistAnswers, ...propData } = parsed.data;

    let computedScore: number | null = null;
    let itemsToCreate = STANDARD_CHECKLIST.map((item) => ({
      category: item.category,
      label: item.label,
      weight: item.weight,
      passed: null as boolean | null,
      notes: null as string | null,
    }));

    if (checklistAnswers && checklistAnswers.length > 0) {
      computedScore = calculateSafetyScore(checklistAnswers);
      itemsToCreate = checklistAnswers.map((a) => ({
        category: a.category,
        label: a.label,
        weight: a.weight,
        passed: a.passed,
        notes: a.notes || null,
      }));
    }

    const status = computedScore !== null && computedScore >= 7 ? "VERIFIED" : "PENDING_VERIFICATION";

    const property = await prisma.property.create({
      data: {
        title: propData.title,
        address: propData.address,
        suburb: propData.suburb,
        city: propData.city,
        priceMonthly: propData.priceMonthly,
        depositAmount: propData.depositAmount || null,
        bedrooms: propData.bedrooms,
        bathrooms: propData.bathrooms || null,
        maxOccupants: propData.maxOccupants || null,
        description: propData.description || null,
        amenities: propData.amenities,
        distanceToCampus: propData.distanceToCampus || null,
        images: propData.images,
        safetyScore: computedScore,
        status,
        landlordId: session.sub,
        checklistItems: {
          create: itemsToCreate,
        },
      },
      include: { checklistItems: true },
    });

    return NextResponse.json({ success: true, property }, { status: 201 });
  } catch (err: any) {
    console.error("Create property error:", err);
    return NextResponse.json({ error: err?.message || "Failed to create residence listing" }, { status: 500 });
  }
}
