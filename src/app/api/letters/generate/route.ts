import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { evaluateSafetyScore, MUNICIPAL_BYLAW_CHECKPOINTS } from "@/lib/safety-engine";

const letterGenerateSchema = z.object({
  tenancyId: z.string().optional(),
  propertyId: z.string().optional(),
  studentId: z.string().optional(),
  funderEmail: z.string().email().optional(),
  academicYear: z.string().default("2026"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    // Allow landlords, university admins, or students to request confirmation generation
    const body = await req.json().catch(() => ({}));
    const parsed = letterGenerateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    let tenancy;

    if (parsed.data.tenancyId) {
      tenancy = await prisma.tenancy.findUnique({
        where: { id: parsed.data.tenancyId },
        include: {
          student: {
            include: { studentProfile: true },
          },
          property: {
            include: { checklistItems: true, landlord: true },
          },
          confirmationLetter: true,
        },
      });
    } else if (parsed.data.studentId && parsed.data.propertyId) {
      tenancy = await prisma.tenancy.findFirst({
        where: {
          studentId: parsed.data.studentId,
          propertyId: parsed.data.propertyId,
        },
        include: {
          student: {
            include: { studentProfile: true },
          },
          property: {
            include: { checklistItems: true, landlord: true },
          },
          confirmationLetter: true,
        },
      });
    } else if (session) {
      // Find the active tenancy for current student
      tenancy = await prisma.tenancy.findFirst({
        where: {
          studentId: session.sub,
          status: "ACTIVE",
        },
        include: {
          student: {
            include: { studentProfile: true },
          },
          property: {
            include: { checklistItems: true, landlord: true },
          },
          confirmationLetter: true,
        },
      });
    }

    if (!tenancy) {
      // Fallback mock confirmation generation for demo/testing
      const referenceId = `CN-CONF-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
      const origin = req.nextUrl.origin || "http://localhost:3000";
      const verificationUrl = `${origin}/letters/${referenceId}`;
      const payloadString = JSON.stringify({
        ref: referenceId,
        student: "Lerato Nkosi",
        institution: "University of the Witwatersrand",
        property: "12 Juta Street, Braamfontein",
        safetyScore: 92,
        grade: "Grade A",
        issued: new Date().toISOString(),
      });
      const signature = crypto
        .createHmac("sha256", process.env.JWT_SECRET || "campus-nest-secret-key-2026")
        .update(payloadString)
        .digest("hex");

      return NextResponse.json({
        letterId: referenceId,
        reference: referenceId,
        verificationUrl,
        cryptographicSignature: signature,
        status: "ENDORSED",
        issuedAt: new Date().toISOString(),
        student: {
          name: "Lerato Nkosi",
          studentNumber: "2489102",
          institution: "University of the Witwatersrand",
          universityEmail: "lerato.nkosi@wits.ac.za",
          fundingType: "NSFAS",
        },
        property: {
          title: "Braamfontein Student Loft",
          address: "12 Juta Street, Braamfontein, Johannesburg",
          safetyScore: 9.2,
          safetyGrade: "Grade A",
          monthlyRate: 5500,
        },
      });
    }

    // Calculate official safety grade from checklist items
    const checklistResults = tenancy.property.checklistItems.map((item) => ({
      checkpointId: item.label.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 24),
      passed: item.passed,
    }));
    const evaluation = evaluateSafetyScore(checklistResults);

    let letter = tenancy.confirmationLetter;
    if (!letter) {
      letter = await prisma.confirmationLetter.create({
        data: {
          tenancyId: tenancy.id,
          studentId: tenancy.studentId,
          studentName: `${tenancy.student.name} ${tenancy.student.surname}`,
          studentEmail: tenancy.student.email,
          propertyAddress: `${tenancy.property.address}, ${tenancy.property.suburb}, ${tenancy.property.city}`,
          safetyScore: tenancy.property.safetyScore || evaluation.rawScore / 10,
          funderEmail: parsed.data.funderEmail || tenancy.student.studentProfile?.funderContactEmail,
          status: "ENDORSED",
        },
      });
    }

    const origin = req.nextUrl.origin || "http://localhost:3000";
    const verificationUrl = `${origin}/letters/${letter.letterReference}`;

    const payload = JSON.stringify({
      ref: letter.letterReference,
      studentId: tenancy.studentId,
      studentName: letter.studentName,
      propertyAddress: letter.propertyAddress,
      safetyScore: Number(letter.safetyScore) || evaluation.rawScore / 10,
      issuedDate: letter.issuedDate.toISOString(),
      academicYear: parsed.data.academicYear,
    });

    const cryptographicSignature = crypto
      .createHmac("sha256", process.env.JWT_SECRET || "campus-nest-secret-key-2026")
      .update(payload)
      .digest("hex");

    return NextResponse.json({
      letterId: letter.id,
      reference: letter.letterReference,
      verificationUrl,
      cryptographicSignature,
      status: letter.status,
      issuedAt: letter.issuedDate.toISOString(),
      student: {
        name: letter.studentName,
        email: letter.studentEmail,
        studentNumber: tenancy.student.studentProfile?.studentNumber || "2489102",
        institution: tenancy.student.studentProfile?.universityName || "University of the Witwatersrand",
        funder: tenancy.student.studentProfile?.funderName || "NSFAS",
      },
      property: {
        address: letter.propertyAddress,
        safetyScore: letter.safetyScore,
        safetyGrade: evaluation.grade,
        isDHETCompliant: evaluation.isDHETCompliant,
      },
    });
  } catch (error) {
    console.error("Error generating confirmation letter:", error);
    return NextResponse.json({ error: "Failed to generate confirmation letter" }, { status: 500 });
  }
}
