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
      universityEmail: true,
      onboardingCompleted: true,
      onboardingStep: true,
      studentProfile: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
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
  dateOfBirth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  preferredLanguage: z.string().optional().nullable(),
});

const step2Schema = z.object({
  phone: z.string().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  emergencyContactRelationship: z.string().optional().nullable(),
  currentAddress: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  isEnrolled: z.boolean().default(false),
  universityName: z.string().optional().nullable(),
  studentNumber: z.string().optional().nullable(),
  degreeProgram: z.string().optional().nullable(),
  yearOfStudy: z.string().optional().nullable(),
  universityEmail: z.string().email("Invalid email format").optional().nullable().or(z.literal("")),
});

const step3Schema = z.object({
  fundingType: z.string().min(1, "Funding type is required"),
  funderName: z.string().optional().nullable(),
  funderReference: z.string().optional().nullable(),
  funderContactEmail: z.string().email("Invalid funder email").optional().nullable().or(z.literal("")),
  monthlyAllowance: z.number().nonnegative().optional().nullable(),
  householdIncomeBracket: z.string().optional().nullable(),
  guarantorName: z.string().optional().nullable(),
  guarantorPhone: z.string().optional().nullable(),
  guarantorRelationship: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
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
          onboardingStep: 2,
        },
      }),
      prisma.studentProfile.upsert({
        where: { userId: session.sub },
        create: {
          userId: session.sub,
          dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth) : null,
          gender: d.gender,
          nationality: d.nationality,
          preferredLanguage: d.preferredLanguage,
        },
        update: {
          dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth) : null,
          gender: d.gender,
          nationality: d.nationality,
          preferredLanguage: d.preferredLanguage,
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
          universityEmail: d.universityEmail && d.universityEmail.trim() !== "" ? d.universityEmail : undefined,
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
      redirect: "/dashboard",
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
