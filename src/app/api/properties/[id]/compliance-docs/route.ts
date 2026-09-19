import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { ComplianceDocType } from "@prisma/client";

const docCreateSchema = z.object({
  documentType: z.nativeEnum(ComplianceDocType),
  title: z.string().min(2),
  fileUrl: z.string().url(),
  fileName: z.string().min(1),
  fileSizeBytes: z.number().optional(),
  issuedDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  issuingBody: z.string().optional().nullable(),
  referenceNumber: z.string().optional().nullable(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const docs = await prisma.propertyComplianceDoc.findMany({
    where: { propertyId: params.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ docs });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || (session.role !== "LANDLORD" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Verify property ownership if landlord
  const property = await prisma.property.findUnique({
    where: { id: params.id },
  });

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  if (session.role === "LANDLORD" && property.landlordId !== session.sub) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = docCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const {
    documentType,
    title,
    fileUrl,
    fileName,
    fileSizeBytes,
    issuedDate,
    expiryDate,
    issuingBody,
    referenceNumber,
  } = parsed.data;

  // Upsert or replace existing document of the same type for this property
  const existingDoc = await prisma.propertyComplianceDoc.findFirst({
    where: {
      propertyId: params.id,
      documentType,
    },
  });

  let doc;
  if (existingDoc) {
    doc = await prisma.propertyComplianceDoc.update({
      where: { id: existingDoc.id },
      data: {
        title,
        fileUrl,
        fileName,
        fileSizeBytes,
        issuedDate: issuedDate ? new Date(issuedDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        issuingBody,
        referenceNumber,
        status: "PENDING_AUDIT",
      },
    });
  } else {
    doc = await prisma.propertyComplianceDoc.create({
      data: {
        propertyId: params.id,
        documentType,
        title,
        fileUrl,
        fileName,
        fileSizeBytes,
        issuedDate: issuedDate ? new Date(issuedDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        issuingBody,
        referenceNumber,
        status: "PENDING_AUDIT",
      },
    });
  }

  return NextResponse.json({ doc, success: true });
}
