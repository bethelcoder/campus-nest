import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const optionalAmount = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.coerce.number().nonnegative().optional()
);

const emergencyContactSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(5),
  relationship: z.string().trim().min(1),
});

const profileSchema = z.object({
  name: z.string().trim().min(1),
  surname: z.string().trim().min(1),
  phone: z.string().trim().min(5).optional().or(z.literal("")),
  idNumber: z.string().trim().min(6).optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.string().trim().optional().or(z.literal("")),
  nationality: z.string().trim().optional().or(z.literal("")),
  preferredLanguage: z.string().trim().optional().or(z.literal("")),
  emergencyContactName: z.string().trim().optional().or(z.literal("")),
  emergencyContactPhone: z.string().trim().optional().or(z.literal("")),
  emergencyContactRelationship: z.string().trim().optional().or(z.literal("")),
  emergencyContacts: z.array(emergencyContactSchema).default([]),
  currentAddress: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().optional().or(z.literal("")),
  province: z.string().trim().optional().or(z.literal("")),
  universityName: z.string().trim().optional().or(z.literal("")),
  studentNumber: z.string().trim().optional().or(z.literal("")),
  degreeProgram: z.string().trim().optional().or(z.literal("")),
  yearOfStudy: z.string().trim().optional().or(z.literal("")),
  fundingType: z.string().trim().optional().or(z.literal("")),
  funderName: z.string().trim().optional().or(z.literal("")),
  funderReference: z.string().trim().optional().or(z.literal("")),
  funderContactEmail: z.string().email("Invalid funder email").optional().or(z.literal("")),
  monthlyAllowance: optionalAmount,
  monthlyBudget: optionalAmount,
  householdIncomeBracket: z.string().trim().optional().or(z.literal("")),
  guarantorName: z.string().trim().optional().or(z.literal("")),
  guarantorPhone: z.string().trim().optional().or(z.literal("")),
  guarantorRelationship: z.string().trim().optional().or(z.literal("")),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    include: { studentProfile: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ user, profile: user.studentProfile });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = profileSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
  if (dateOfBirth && Number.isNaN(dateOfBirth.getTime())) {
    return NextResponse.json({ error: "Invalid date of birth" }, { status: 400 });
  }

  const emergencyContacts = data.emergencyContacts.filter(
    (contact) => contact.name || contact.phone || contact.relationship
  );

  const [user] = await prisma.$transaction([
    prisma.user.update({
      where: { id: session.sub },
      data: {
        name: data.name,
        surname: data.surname,
        phone: data.phone || null,
        idNumber: data.idNumber || null,
      },
      include: { studentProfile: true },
    }),
    prisma.studentProfile.upsert({
      where: { userId: session.sub },
      create: {
        userId: session.sub,
        dateOfBirth,
        gender: data.gender || null,
        nationality: data.nationality || null,
        preferredLanguage: data.preferredLanguage || null,
        emergencyContactName: data.emergencyContactName || null,
        emergencyContactPhone: data.emergencyContactPhone || null,
        emergencyContactRelationship: data.emergencyContactRelationship || null,
        emergencyContacts,
        currentAddress: data.currentAddress || null,
        city: data.city || null,
        province: data.province || null,
        universityName: data.universityName || null,
        studentNumber: data.studentNumber || null,
        degreeProgram: data.degreeProgram || null,
        yearOfStudy: data.yearOfStudy || null,
        fundingType: data.fundingType || null,
        funderName: data.funderName || null,
        funderReference: data.funderReference || null,
        funderContactEmail: data.funderContactEmail || null,
        monthlyAllowance: data.monthlyAllowance ?? null,
        monthlyBudget: data.monthlyBudget ?? null,
        householdIncomeBracket: data.householdIncomeBracket || null,
        guarantorName: data.guarantorName || null,
        guarantorPhone: data.guarantorPhone || null,
        guarantorRelationship: data.guarantorRelationship || null,
      },
      update: {
        dateOfBirth,
        gender: data.gender || null,
        nationality: data.nationality || null,
        preferredLanguage: data.preferredLanguage || null,
        emergencyContactName: data.emergencyContactName || null,
        emergencyContactPhone: data.emergencyContactPhone || null,
        emergencyContactRelationship: data.emergencyContactRelationship || null,
        emergencyContacts,
        currentAddress: data.currentAddress || null,
        city: data.city || null,
        province: data.province || null,
        universityName: data.universityName || null,
        studentNumber: data.studentNumber || null,
        degreeProgram: data.degreeProgram || null,
        yearOfStudy: data.yearOfStudy || null,
        fundingType: data.fundingType || null,
        funderName: data.funderName || null,
        funderReference: data.funderReference || null,
        funderContactEmail: data.funderContactEmail || null,
        monthlyAllowance: data.monthlyAllowance ?? null,
        monthlyBudget: data.monthlyBudget ?? null,
        householdIncomeBracket: data.householdIncomeBracket || null,
        guarantorName: data.guarantorName || null,
        guarantorPhone: data.guarantorPhone || null,
        guarantorRelationship: data.guarantorRelationship || null,
      },
    }),
  ]);

  return NextResponse.json({ user });
}
