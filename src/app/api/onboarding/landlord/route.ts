import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { signSession, SESSION_COOKIE } from "@/lib/auth";
import { calculateSafetyScore, isChecklistComplete, STANDARD_CHECKLIST } from "@/lib/safety";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      role: true,
      name: true,
      surname: true,
      email: true,
      phone: true,
      idNumber: true,
      onboardingCompleted: true,
      onboardingStep: true,
      landlordProfile: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let profile = user.landlordProfile;
  if (!profile) {
    profile = await prisma.landlordProfile.create({
      data: { userId: user.id },
    });
  }

  return NextResponse.json({ user, profile });
}

const step1Schema = z.object({
  name: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  phone: z.string().min(5, "Contact phone is required"),
  idNumber: z.string().optional().nullable(),
  entityType: z.string().min(1, "Entity type is required"),
  companyName: z.string().optional().nullable(),
  companyRegNumber: z.string().optional().nullable(),
});

const step2Schema = z.object({
  draftResidenceName: z.string().min(1, "Residence/Building name is required"),
  draftAddress: z.string().min(1, "Street address is required"),
  draftSuburb: z.string().min(1, "Suburb is required"),
  draftCity: z.string().min(1, "City is required"),
  draftNearestUniversity: z.string().optional().nullable(),
  draftDistanceToCampus: z.number().nonnegative().optional().nullable(),
  draftBedrooms: z.number().int().positive().default(1),
  draftPriceMonthly: z.number().positive("Monthly rental rate must be positive"),
  draftAmenities: z.array(z.string()).default([]),
});

const step3Schema = z.object({
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
  ),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const step = Number(body.step);

  if (step === 1) {
    const parsed = step1Schema.safeParse(body.data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const d = parsed.data;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.sub },
        data: {
          name: d.name,
          surname: d.surname,
          phone: d.phone,
          idNumber: d.idNumber,
          onboardingStep: 2,
        },
      }),
      prisma.landlordProfile.upsert({
        where: { userId: session.sub },
        create: {
          userId: session.sub,
          entityType: d.entityType,
          companyName: d.companyName,
          companyRegNumber: d.companyRegNumber,
          contactPhone: d.phone,
        },
        update: {
          entityType: d.entityType,
          companyName: d.companyName,
          companyRegNumber: d.companyRegNumber,
          contactPhone: d.phone,
        },
      }),
    ]);

    return NextResponse.json({ success: true, nextStep: 2 });
  }

  if (step === 2) {
    const parsed = step2Schema.safeParse(body.data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const d = parsed.data;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.sub },
        data: {
          onboardingStep: 3,
        },
      }),
      prisma.landlordProfile.upsert({
        where: { userId: session.sub },
        create: {
          userId: session.sub,
          draftResidenceName: d.draftResidenceName,
          draftAddress: d.draftAddress,
          draftSuburb: d.draftSuburb,
          draftCity: d.draftCity,
          draftNearestUniversity: d.draftNearestUniversity,
          draftDistanceToCampus: d.draftDistanceToCampus != null ? d.draftDistanceToCampus : null,
          draftBedrooms: d.draftBedrooms,
          draftPriceMonthly: d.draftPriceMonthly,
          draftAmenities: d.draftAmenities,
        },
        update: {
          draftResidenceName: d.draftResidenceName,
          draftAddress: d.draftAddress,
          draftSuburb: d.draftSuburb,
          draftCity: d.draftCity,
          draftNearestUniversity: d.draftNearestUniversity,
          draftDistanceToCampus: d.draftDistanceToCampus != null ? d.draftDistanceToCampus : null,
          draftBedrooms: d.draftBedrooms,
          draftPriceMonthly: d.draftPriceMonthly,
          draftAmenities: d.draftAmenities,
        },
      }),
    ]);

    return NextResponse.json({ success: true, nextStep: 3 });
  }

  if (step === 3) {
    const parsed = step3Schema.safeParse(body.data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const answers = parsed.data.checklistAnswers;

    const profile = await prisma.landlordProfile.findUnique({
      where: { userId: session.sub },
    });

    const safetyScore = calculateSafetyScore(answers);
    const complete = isChecklistComplete(answers);

    // Create the landlord's first property and populate the 13 checklist items
    const property = await prisma.property.create({
      data: {
        title: profile?.draftResidenceName || "Accredited Student Residence",
        address: profile?.draftAddress || "Address not provided",
        suburb: profile?.draftSuburb || "Suburb",
        city: profile?.draftCity || "Johannesburg",
        priceMonthly: profile?.draftPriceMonthly ? Number(profile.draftPriceMonthly) : 4800,
        bedrooms: profile?.draftBedrooms || 1,
        distanceToCampus: profile?.draftDistanceToCampus ? Number(profile.draftDistanceToCampus) : null,
        amenities: profile?.draftAmenities || [],
        landlordId: session.sub,
        safetyScore,
        status: complete ? "VERIFIED" : "PENDING_VERIFICATION",
        checklistItems: {
          create: answers.map((item) => ({
            category: item.category,
            label: item.label,
            weight: item.weight,
            passed: item.passed,
            notes: item.notes,
          })),
        },
      },
      include: { checklistItems: true },
    });

    const updatedUser = await prisma.user.update({
      where: { id: session.sub },
      data: {
        onboardingCompleted: true,
        onboardingStep: 3,
      },
    });

    // Sign fresh session token
    const token = await signSession({
      sub: updatedUser.id,
      role: updatedUser.role,
      emailVerified: false,
      onboardingCompleted: true,
      onboardingStep: 3,
    });

    const res = NextResponse.json({
      success: true,
      onboardingCompleted: true,
      propertyId: property.id,
      redirect: "/landlord/properties",
    });

    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  }

  return NextResponse.json({ error: "Invalid step" }, { status: 400 });
}
