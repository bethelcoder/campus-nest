import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { notifyUser } from "@/lib/notifications";
import { calculateSafetyScore } from "@/lib/safety";

const statusUpdateSchema = z.object({
  status: z.enum(["VERIFIED", "FLAGGED", "REJECTED", "PENDING_VERIFICATION", "DRAFT"]).optional(),
  verify: z.boolean().optional(),
  physicalInspectionAt: z.string().optional().nullable(),
  physicalInspectorName: z.string().optional().nullable(),
  accreditationReference: z.string().optional().nullable(),
  message: z.string().trim().max(500).optional(),
  checklistUpdates: z
    .array(
      z.object({
        id: z.string(),
        passed: z.boolean(),
        notes: z.string().optional().nullable(),
      })
    )
    .optional(),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Only platform admins can view property audit dossier" }, { status: 403 });
  }

  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      landlord: {
        select: {
          id: true,
          name: true,
          surname: true,
          email: true,
          phone: true,
          idNumber: true,
          createdAt: true,
          landlordProfile: true,
        },
      },
      complianceDocs: {
        orderBy: { createdAt: "desc" },
      },
      checklistItems: {
        orderBy: { category: "asc" },
      },
      roomUnits: {
        include: {
          beds: true,
        },
        orderBy: { unitNumber: "asc" },
      },
      roomListings: {
        orderBy: { monthlyRent: "asc" },
      },
      reports: {
        orderBy: { createdAt: "desc" },
        include: {
          reporter: {
            select: { name: true, surname: true, email: true },
          },
        },
      },
      _count: {
        select: {
          applications: true,
          tenancies: true,
          favorites: true,
        },
      },
    },
  });

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  return NextResponse.json({ property });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Only platform admins can update property status" }, { status: 403 });
  }

  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: { checklistItems: true },
  });
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = statusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { status, verify, physicalInspectionAt, physicalInspectorName, accreditationReference, message, checklistUpdates } = parsed.data;

  // 1. Process checklist updates if provided
  if (checklistUpdates && checklistUpdates.length > 0) {
    await Promise.all(
      checklistUpdates.map((item) =>
        prisma.checklistItem.update({
          where: { id: item.id },
          data: {
            passed: item.passed,
            notes: item.notes !== undefined ? item.notes : undefined,
          },
        })
      )
    );

    // Fetch refreshed items to recompute score
    const refreshedChecklist = await prisma.checklistItem.findMany({
      where: { propertyId: property.id },
    });
    const newScore = calculateSafetyScore(refreshedChecklist);
    await prisma.property.update({
      where: { id: property.id },
      data: {
        safetyScore: newScore !== null ? newScore : undefined,
      },
    });
  }

  // 2. Validate verification criteria if setting status to VERIFIED
  if (status === "VERIFIED") {
    const checklistItems = await prisma.checklistItem.findMany({
      where: { propertyId: property.id },
      select: { passed: true },
    });
    if (!checklistItems.length || checklistItems.some((item) => item.passed !== true)) {
      return NextResponse.json(
        {
          error:
            "This residence cannot be accredited until every safety and compliance checkpoint is marked as passed in the audit checklist.",
        },
        { status: 409 }
      );
    }
  }

  const targetStatus = status || property.status;
  const isVerifying = targetStatus === "VERIFIED" || verify;

  const defaultRef = property.accreditationReference || `CN-${property.id.slice(-8).toUpperCase()}`;

  const updated = await prisma.property.update({
    where: { id: params.id },
    data: {
      status: targetStatus,
      ...(isVerifying
        ? {
            physicalInspectionAt: physicalInspectionAt ? new Date(physicalInspectionAt) : (property.physicalInspectionAt || new Date()),
            physicalInspectorName: physicalInspectorName || property.physicalInspectorName || "CampusNest Platform Admin",
            accreditationReference: accreditationReference || defaultRef,
          }
        : targetStatus === "REJECTED" || targetStatus === "PENDING_VERIFICATION"
        ? {
            physicalInspectionAt: null,
            physicalInspectorName: null,
          }
        : {
            physicalInspectionAt: physicalInspectionAt ? new Date(physicalInspectionAt) : undefined,
            physicalInspectorName: physicalInspectorName !== undefined ? physicalInspectorName : undefined,
            accreditationReference: accreditationReference !== undefined ? accreditationReference : undefined,
          }),
    },
    include: {
      checklistItems: true,
      complianceDocs: true,
    },
  });

  if (status && status !== property.status) {
    await notifyUser({
      recipientId: property.landlordId,
      type: "RESIDENCE_REVIEW",
      title: "Residence review update",
      message:
        message ||
        `Your residence "${property.title}" was marked ${targetStatus.replaceAll("_", " ").toLowerCase()} by CampusNest administration.`,
      metadata: { propertyId: property.id, status: targetStatus },
    });
  }

  return NextResponse.json({ property: updated, success: true });
}
