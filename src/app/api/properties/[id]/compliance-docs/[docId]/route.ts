import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; docId: string } }
) {
  const session = await getSession();
  if (!session || (session.role !== "LANDLORD" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const doc = await prisma.propertyComplianceDoc.findUnique({
    where: { id: params.docId },
    include: { property: true },
  });

  if (!doc || doc.propertyId !== params.id) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  if (session.role === "LANDLORD" && doc.property.landlordId !== session.sub) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.propertyComplianceDoc.delete({
    where: { id: params.docId },
  });

  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; docId: string } }
) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "LANDLORD")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const doc = await prisma.propertyComplianceDoc.findUnique({
    where: { id: params.docId },
    include: { property: true },
  });

  if (!doc || doc.propertyId !== params.id) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const updateData: any = {};

  if (session.role === "ADMIN") {
    if (body.status) updateData.status = body.status;
    if (body.rejectionReason !== undefined) updateData.rejectionReason = body.rejectionReason;
    if (body.status === "VALID") {
      updateData.verifiedAt = new Date();
      updateData.verifiedByAdminId = session.sub;
    }
  }

  if (body.expiryDate) updateData.expiryDate = new Date(body.expiryDate);
  if (body.issuedDate) updateData.issuedDate = new Date(body.issuedDate);
  if (body.referenceNumber !== undefined) updateData.referenceNumber = body.referenceNumber;
  if (body.issuingBody !== undefined) updateData.issuingBody = body.issuingBody;

  const updated = await prisma.propertyComplianceDoc.update({
    where: { id: params.docId },
    data: updateData,
  });

  return NextResponse.json({ doc: updated, success: true });
}
