import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const kycSchema = z.object({
  entityType: z.enum(["INDIVIDUAL", "PRIVATE_RESIDENCE", "AGENCY", "PTY_LTD", "TRUST"]).optional(),
  companyName: z.string().min(2).optional().nullable(),
  companyRegNumber: z.string().optional().nullable(),
  cipcDocumentUrl: z.string().url().optional().nullable(),
  taxNumber: z.string().optional().nullable(),
  taxPin: z.string().optional().nullable(),
  taxClearanceDocUrl: z.string().url().optional().nullable(),
  businessAddress: z.string().optional().nullable(),
  proofOfAddressDocUrl: z.string().url().optional().nullable(),
  contactPhone: z.string().optional().nullable(),

  directorIdNumber: z.string().optional().nullable(),
  directorIdDocUrl: z.string().url().optional().nullable(),
  directorIdCertified: z.boolean().optional(),

  bankName: z.string().optional().nullable(),
  bankAccountType: z.string().optional().nullable(),
  bankAccountNumber: z.string().optional().nullable(),
  bankBranchCode: z.string().optional().nullable(),
  bankConfirmationDocUrl: z.string().url().optional().nullable(),

  providerAssociationNo: z.string().optional().nullable(),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const profile = await prisma.landlordProfile.findUnique({
    where: { userId: session.sub },
    include: {
      user: {
        select: {
          name: true,
          surname: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  return NextResponse.json({ profile });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = kycSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const {
    entityType,
    companyName,
    companyRegNumber,
    cipcDocumentUrl,
    taxNumber,
    taxPin,
    taxClearanceDocUrl,
    businessAddress,
    proofOfAddressDocUrl,
    contactPhone,
    directorIdNumber,
    directorIdDocUrl,
    directorIdCertified,
    bankName,
    bankAccountType,
    bankAccountNumber,
    bankBranchCode,
    bankConfirmationDocUrl,
    providerAssociationNo,
  } = parsed.data;

  // Check if at least core documents are submitted to trigger PENDING_REVIEW
  const hasDocuments = Boolean(
    (cipcDocumentUrl || directorIdDocUrl) && bankConfirmationDocUrl
  );

  const updated = await prisma.landlordProfile.upsert({
    where: { userId: session.sub },
    create: {
      userId: session.sub,
      entityType: entityType || "PRIVATE_RESIDENCE",
      companyName,
      companyRegNumber,
      cipcDocumentUrl,
      taxNumber,
      taxPin,
      taxClearanceDocUrl,
      businessAddress,
      proofOfAddressDocUrl,
      contactPhone,
      directorIdNumber,
      directorIdDocUrl,
      directorIdCertified: directorIdCertified ?? false,
      bankName,
      bankAccountType,
      bankAccountNumber,
      bankBranchCode,
      bankConfirmationDocUrl,
      providerAssociationNo,
      verificationStatus: hasDocuments ? "PENDING_REVIEW" : "UNVERIFIED",
    },
    update: {
      entityType: entityType !== undefined ? entityType : undefined,
      companyName: companyName !== undefined ? companyName : undefined,
      companyRegNumber: companyRegNumber !== undefined ? companyRegNumber : undefined,
      cipcDocumentUrl: cipcDocumentUrl !== undefined ? cipcDocumentUrl : undefined,
      taxNumber: taxNumber !== undefined ? taxNumber : undefined,
      taxPin: taxPin !== undefined ? taxPin : undefined,
      taxClearanceDocUrl: taxClearanceDocUrl !== undefined ? taxClearanceDocUrl : undefined,
      businessAddress: businessAddress !== undefined ? businessAddress : undefined,
      proofOfAddressDocUrl: proofOfAddressDocUrl !== undefined ? proofOfAddressDocUrl : undefined,
      contactPhone: contactPhone !== undefined ? contactPhone : undefined,
      directorIdNumber: directorIdNumber !== undefined ? directorIdNumber : undefined,
      directorIdDocUrl: directorIdDocUrl !== undefined ? directorIdDocUrl : undefined,
      directorIdCertified: directorIdCertified !== undefined ? directorIdCertified : undefined,
      bankName: bankName !== undefined ? bankName : undefined,
      bankAccountType: bankAccountType !== undefined ? bankAccountType : undefined,
      bankAccountNumber: bankAccountNumber !== undefined ? bankAccountNumber : undefined,
      bankBranchCode: bankBranchCode !== undefined ? bankBranchCode : undefined,
      bankConfirmationDocUrl: bankConfirmationDocUrl !== undefined ? bankConfirmationDocUrl : undefined,
      providerAssociationNo: providerAssociationNo !== undefined ? providerAssociationNo : undefined,
      verificationStatus: hasDocuments ? "PENDING_REVIEW" : undefined,
    },
  });

  return NextResponse.json({ profile: updated, success: true });
}
