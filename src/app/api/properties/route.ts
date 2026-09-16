import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { STANDARD_CHECKLIST } from "@/lib/safety";

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
  title: z.string().min(1),
  address: z.string().min(1),
  suburb: z.string().min(1),
  city: z.string().min(1),
  priceMonthly: z.number().positive(),
  depositAmount: z.number().nonnegative().optional(),
  bedrooms: z.number().int().positive(),
  bathrooms: z.number().int().positive().optional(),
  maxOccupants: z.number().int().positive().optional(),
  description: z.string().optional(),
  amenities: z.array(z.string()).default([]),
  distanceToCampus: z.number().nonnegative().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") {
    return NextResponse.json({ error: "Only landlords can create listings" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createPropertySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const property = await prisma.property.create({
    data: {
      ...parsed.data,
      landlordId: session.sub,
      status: "DRAFT",
      // Every property gets the full standard checklist immediately so the
      // landlord fills in pass/fail per item rather than the app inventing
      // a checklist shape on the fly per listing.
      checklistItems: {
        create: STANDARD_CHECKLIST.map((item) => ({
          category: item.category,
          label: item.label,
          weight: item.weight,
        })),
      },
    },
    include: { checklistItems: true },
  });

  return NextResponse.json({ property }, { status: 201 });
}
