import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { calculateSafetyScore, isChecklistComplete } from "@/lib/safety";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: { checklistItems: true, landlord: { select: { name: true, surname: true } } },
  });
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ property });
}

const checklistUpdateSchema = z.object({
  checklistAnswers: z.array(
    z.object({
      id: z.string(),
      passed: z.boolean().nullable(),
      notes: z.string().optional(),
    })
  ),
});

const physicalVerificationSchema = z.object({
  physicalInspectionAt: z.string().datetime(),
  physicalInspectorName: z.string().min(2),
  accreditationReference: z.string().min(3).optional(),
});

// General listing fields a landlord can update on their own property.
// Safety score / accreditation status are never settable here — those are
// derived server-side from the checklist and physical inspection only.
const generalUpdateSchema = z.object({
  title: z.string().min(1, "Residence title is required").optional(),
  address: z.string().min(1, "Street address is required").optional(),
  suburb: z.string().min(1, "Suburb is required").optional(),
  city: z.string().min(1, "City is required").optional(),
  priceMonthly: z.number().positive("Monthly price must be positive").optional(),
  depositAmount: z.number().nonnegative("Deposit cannot be negative").nullable().optional(),
  bedrooms: z.number().int("Bedrooms must be a whole number").positive("Bedrooms must be at least 1").optional(),
  bathrooms: z.number().int().positive("Bathrooms must be at least 1").nullable().optional(),
  maxOccupants: z.number().int().positive("Max occupants must be at least 1").nullable().optional(),
  description: z.string().nullable().optional(),
  amenities: z.array(z.string()).optional(),
  distanceToCampus: z.number().nonnegative("Distance cannot be negative").nullable().optional(),
  images: z.array(z.string()).optional(),
});

// Landlord submits/updates checklist answers. Safety score is recalculated
// server-side on every save — never trust a client-submitted score, since
// that field directly drives the public "verified safe" signal.
// A landlord can update the general listing information and/or resubmit the
// safety checklist. General fields are validated in isolation; when checklist
// answers are included, the safety score is recalculated server-side and can
// promote/demote the accreditation status — never trusting client values.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  const isAdmin = session?.role === "ADMIN";
  if (!session || (session.role !== "LANDLORD" && !isAdmin)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const property = await prisma.property.findUnique({ where: { id: params.id } });
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (isAdmin) {
    const body = await req.json();
    const parsed = physicalVerificationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const updated = await prisma.property.update({
      where: { id: params.id },
      data: {
        physicalInspectionAt: new Date(parsed.data.physicalInspectionAt),
        physicalInspectorName: parsed.data.physicalInspectorName,
        accreditationReference: parsed.data.accreditationReference,
      },
    });
    return NextResponse.json({ property: updated });
  }

  if (property.landlordId !== session.sub) {
    return NextResponse.json({ error: "Not your property" }, { status: 403 });
  }

  const body = await req.json();
  const hasChecklist = Array.isArray(body.checklistAnswers);

  const parsedGeneral = generalUpdateSchema.safeParse(body);
  if (!parsedGeneral.success) {
    return NextResponse.json({ error: parsedGeneral.error.flatten() }, { status: 400 });
  }

  if (Object.keys(parsedGeneral.data).length === 0 && !hasChecklist) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  // Normalize empty strings to null for optional fields so Prisma stores
  // genuine "not provided" rather than blank strings.
  const data: any = { ...parsedGeneral.data };
  for (const key of ["depositAmount", "bathrooms", "maxOccupants", "distanceToCampus", "description"]) {
    if (data[key] === undefined || data[key] === null) continue;
    if (data[key] === "") data[key] = null;
  }

  let checklistPayload: { id: string; passed: boolean | null; notes?: string }[] | null = null;
  if (hasChecklist) {
    const parsedChecklist = checklistUpdateSchema.safeParse(body);
    if (!parsedChecklist.success) {
      return NextResponse.json({ error: parsedChecklist.error.flatten() }, { status: 400 });
    }
    checklistPayload = parsedChecklist.data.checklistAnswers;

    if (checklistPayload.length > 0) {
      await prisma.$transaction(
        checklistPayload.map((answer) =>
          // passed may be null when the landlord hasn't answered an item yet —
          // leave it unanswered but still persist any typed notes.
          prisma.checklistItem.update({
            where: { id: answer.id },
            data: { passed: answer.passed, notes: answer.notes },
          })
        )
      );
    }

    const allItems = await prisma.checklistItem.findMany({ where: { propertyId: params.id } });
    data.safetyScore = calculateSafetyScore(allItems);
    data.status = isChecklistComplete(allItems) ? "VERIFIED" : "PENDING_VERIFICATION";
  }

  const updated = await prisma.property.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ property: updated });
}

// Landlord (or admin) permanently removes a residence listing. Deletion is
// refused while the property still carries live obligations — active/pending
// tenancies or unanswered applications — so that student records and
// confirmation letters are never silently orphaned after the fact.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  const isAdmin = session?.role === "ADMIN";
  if (!session || (session.role !== "LANDLORD" && !isAdmin)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const property = await prisma.property.findUnique({ where: { id: params.id } });
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!isAdmin && property.landlordId !== session.sub) {
    return NextResponse.json({ error: "Not your property" }, { status: 403 });
  }

  const [liveTenancies, unansweredApplications] = await Promise.all([
    prisma.tenancy.count({ where: { propertyId: params.id, NOT: { status: "ENDED" } } }),
    prisma.application.count({ where: { propertyId: params.id, NOT: { status: "REJECTED" } } }),
  ]);

  if (liveTenancies > 0 || unansweredApplications > 0) {
    return NextResponse.json(
      {
        error:
          "This residence cannot be deleted while it still has active tenancies or unanswered student applications. Resolve or end them first.",
        code: "PROPERTY_IN_USE",
        activeTenancies: liveTenancies,
        pendingApplications: unansweredApplications,
      },
      { status: 409 }
    );
  }

  await prisma.property.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
