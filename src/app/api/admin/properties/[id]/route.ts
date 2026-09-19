import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { notifyUser } from "@/lib/notifications";

const statusUpdateSchema = z.object({
  status: z.enum(["VERIFIED", "FLAGGED", "REJECTED", "PENDING_VERIFICATION", "DRAFT"]),
  verify: z.boolean().optional(),
  message: z.string().trim().min(1).max(500).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Only platform admins can update property status" }, { status: 403 });
  }

  const property = await prisma.property.findUnique({ where: { id: params.id } });
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = statusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { status } = parsed.data;

  const isVerifying = status === "VERIFIED" || parsed.data.verify;

  const updated = await prisma.property.update({
    where: { id: params.id },
    data: {
      status,
      ...(isVerifying
        ? {
            physicalInspectionAt: new Date(),
            physicalInspectorName: "CampusNest Platform Admin",
            accreditationReference: property.accreditationReference || `CN-${property.id.slice(-8).toUpperCase()}`,
          }
        : status === "REJECTED" || status === "PENDING_VERIFICATION"
        ? {
            physicalInspectionAt: null,
            physicalInspectorName: null,
          }
        : {}),
    },
  });

  await notifyUser({
    recipientId: property.landlordId,
    type: "RESIDENCE_REVIEW",
    title: "Residence review update",
    message: parsed.data.message || `Your residence "${property.title}" was marked ${status.replaceAll("_", " ").toLowerCase()} by CampusNest administration.`,
    metadata: { propertyId: property.id, status },
  });

  return NextResponse.json({ property: updated });
}
