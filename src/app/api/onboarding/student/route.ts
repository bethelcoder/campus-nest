import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { signSession, SESSION_COOKIE } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
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
      universityEmail: true,
      emailVerifiedAt: true,
      onboardingCompleted: true,
      onboardingStep: true,
      studentProfile: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.emailVerifiedAt) {
    return NextResponse.json({ error: "Email verification required", needsVerification: true, email: user.email }, { status: 403 });
  }

  let profile = user.studentProfile;
  if (!profile) {
    profile = await prisma.studentProfile.create({
      data: { userId: user.id },
    });
  }

  return NextResponse.json({ user, profile });
}

const step1Schema = z.object({
  name: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  nationality: z.string().min(1, "Nationality is required"),
  preferredLanguage: z.string().optional().nullable(),
  idNumber: z.string().min(6, "Valid ID / Passport number is required"),
  idDocumentUrl: z.string().min(1, "Certified ID document upload is required"),
  idDocumentName: z.string().optional().nullable(),
  idDocumentCertified: z.boolean().refine((val) => val === true, {
    message: "You must confirm that your ID copy is officially certified.",
  }),
  idCertificationDate: z.string().min(1, "Certification stamp date is required"),
});

const step2Schema = z.object({
  phone: z.string().min(5, "Primary mobile number is required"),
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(5, "Emergency contact phone is required"),
  emergencyContactRelationship: z.string().min(1, "Emergency contact relationship is required"),
  currentAddress: z.string().min(1, "Home address is required"),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  isEnrolled: z.boolean().default(false),
  universityName: z.string().optional().nullable(),
  studentNumber: z.string().optional().nullable(),
  degreeProgram: z.string().optional().nullable(),
  yearOfStudy: z.string().optional().nullable(),
  proofOfRegistrationUrl: z.string().optional().nullable(),
  proofOfRegistrationName: z.string().optional().nullable(),
}).refine((data) => {
  if (data.isEnrolled) {
    return !!data.universityName && !!data.studentNumber && !!data.degreeProgram && !!data.yearOfStudy && !!data.proofOfRegistrationUrl;
  }
  return true;
}, {
  message: "All university enrollment fields and Proof of Registration document are required when enrolled.",
});

const step3Schema = z.object({
  fundingType: z.string().min(1, "Funding type is required"),
  funderName: z.string().optional().nullable(),
  funderReference: z.string().optional().nullable(),
  funderContactEmail: z.string().email("Invalid funder email").optional().nullable().or(z.literal("")),
  monthlyAllowance: z.number().nonnegative().optional().nullable(),
  monthlyBudget: z.number().positive("Monthly budget must be a positive amount with 2 decimal places"),
  householdIncomeBracket: z.string().min(1, "Household income bracket is required"),
  guarantorName: z.string().optional().nullable(),
  guarantorPhone: z.string().optional().nullable(),
  guarantorRelationship: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { emailVerifiedAt: true, email: true },
  });

  if (!user?.emailVerifiedAt) {
    return NextResponse.json({ error: "Email verification required", needsVerification: true, email: user?.email }, { status: 403 });
  }

  const body = await req.json();
  const step = Number(body.step);

  if (step === 1) {
    const parsed = step1Schema.safeParse(body.data);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const d = parsed.data;

    // Validate that the certification date is no older than 3 months (90 days)
    const certDate = new Date(d.idCertificationDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - certDate.getTime()) / (1000 * 60 * 60 * 24));

    if (isNaN(certDate.getTime())) {
      return NextResponse.json({ error: "Invalid certification date format." }, { status: 400 });
    }

    if (diffDays < 0) {
      return NextResponse.json({ error: "Certification stamp date cannot be in the future." }, { status: 400 });
    }

    if (diffDays > 90) {
      return NextResponse.json(
        { error: "Certified ID document cannot be older than 3 months (90 days) per compliance standards." },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.sub },
        data: {
          name: d.name,
          surname: d.surname,
          idNumber: d.idNumber,
          onboardingStep: 2,
        },
      }),
      prisma.studentProfile.upsert({
        where: { userId: session.sub },
        create: {
          userId: session.sub,
          dateOfBirth: new Date(d.dateOfBirth),
          gender: d.gender,
          nationality: d.nationality,
          preferredLanguage: d.preferredLanguage,
          idDocumentUrl: d.idDocumentUrl,
          idDocumentName: d.idDocumentName,
          idDocumentCertified: d.idDocumentCertified,
          idCertificationDate: certDate,
        },
        update: {
          dateOfBirth: new Date(d.dateOfBirth),
          gender: d.gender,
          nationality: d.nationality,
          preferredLanguage: d.preferredLanguage,
          idDocumentUrl: d.idDocumentUrl,
          idDocumentName: d.idDocumentName,
          idDocumentCertified: d.idDocumentCertified,
          idCertificationDate: certDate,
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
          phone: d.phone ?? undefined,
          onboardingStep: 3,
        },
      }),
      prisma.studentProfile.upsert({
        where: { userId: session.sub },
        create: {
          userId: session.sub,
          emergencyContactName: d.emergencyContactName,
          emergencyContactPhone: d.emergencyContactPhone,
          emergencyContactRelationship: d.emergencyContactRelationship,
          currentAddress: d.currentAddress,
          city: d.city,
          province: d.province,
          isEnrolled: d.isEnrolled,
          universityName: d.isEnrolled ? d.universityName : null,
          studentNumber: d.isEnrolled ? d.studentNumber : null,
          degreeProgram: d.isEnrolled ? d.degreeProgram : null,
          yearOfStudy: d.isEnrolled ? d.yearOfStudy : null,
          proofOfRegistrationUrl: d.isEnrolled ? d.proofOfRegistrationUrl : null,
          proofOfRegistrationName: d.isEnrolled ? d.proofOfRegistrationName : null,
        },
        update: {
          emergencyContactName: d.emergencyContactName,
          emergencyContactPhone: d.emergencyContactPhone,
          emergencyContactRelationship: d.emergencyContactRelationship,
          currentAddress: d.currentAddress,
          city: d.city,
          province: d.province,
          isEnrolled: d.isEnrolled,
          universityName: d.isEnrolled ? d.universityName : null,
          studentNumber: d.isEnrolled ? d.studentNumber : null,
          degreeProgram: d.isEnrolled ? d.degreeProgram : null,
          yearOfStudy: d.isEnrolled ? d.yearOfStudy : null,
          proofOfRegistrationUrl: d.isEnrolled ? d.proofOfRegistrationUrl : null,
          proofOfRegistrationName: d.isEnrolled ? d.proofOfRegistrationName : null,
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
    const d = parsed.data;

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: session.sub },
        data: {
          onboardingCompleted: true,
          onboardingStep: 3,
        },
      }),
      prisma.studentProfile.upsert({
        where: { userId: session.sub },
        create: {
          userId: session.sub,
          fundingType: d.fundingType,
          funderName: d.funderName,
          funderReference: d.funderReference,
          funderContactEmail: d.funderContactEmail && d.funderContactEmail.trim() !== "" ? d.funderContactEmail : null,
          monthlyAllowance: d.monthlyAllowance != null ? d.monthlyAllowance : null,
          monthlyBudget: d.monthlyBudget,
          householdIncomeBracket: d.householdIncomeBracket,
          guarantorName: d.guarantorName,
          guarantorPhone: d.guarantorPhone,
          guarantorRelationship: d.guarantorRelationship,
        },
        update: {
          fundingType: d.fundingType,
          funderName: d.funderName,
          funderReference: d.funderReference,
          funderContactEmail: d.funderContactEmail && d.funderContactEmail.trim() !== "" ? d.funderContactEmail : null,
          monthlyAllowance: d.monthlyAllowance != null ? d.monthlyAllowance : null,
          monthlyBudget: d.monthlyBudget,
          householdIncomeBracket: d.householdIncomeBracket,
          guarantorName: d.guarantorName,
          guarantorPhone: d.guarantorPhone,
          guarantorRelationship: d.guarantorRelationship,
        },
      }),
    ]);

    // Sign fresh token with onboardingCompleted: true
    const token = await signSession({
      sub: updatedUser.id,
      role: updatedUser.role,
      emailVerified: !!updatedUser.emailVerifiedAt,
      onboardingCompleted: true,
      onboardingStep: 3,
    });

    const res = NextResponse.json({
      success: true,
      onboardingCompleted: true,
      redirect: "/dashboard/student",
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

