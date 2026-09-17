import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { signSession, SESSION_COOKIE } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") {
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
      onboardingCompleted: true,
      onboardingStep: true,
      landlordProfile: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let profile = user.landlordProfile;
  if (!profile) {
    profile = await prisma.landlordProfile.create({
      data: { userId: user.id },
    });
  }

  return NextResponse.json({ user, profile });
}

const landlordProfileSchema = z.object({
  name: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  phone: z.string().min(5, "Contact phone is required"),
  idNumber: z.string().optional().nullable(),
  entityType: z.enum(["INDIVIDUAL", "PRIVATE_RESIDENCE", "AGENCY"]).default("INDIVIDUAL"),
  companyName: z.string().optional().nullable(),
  companyRegNumber: z.string().optional().nullable(),
  taxNumber: z.string().optional().nullable(),
  businessAddress: z.string().min(3, "Operating address is required"),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = landlordProfileSchema.safeParse(body.data || body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const d = parsed.data;

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: session.sub },
        data: {
          name: d.name,
          surname: d.surname,
          phone: d.phone,
          idNumber: d.idNumber || undefined,
          onboardingCompleted: true,
          onboardingStep: 1,
        },
      }),
      prisma.landlordProfile.upsert({
        where: { userId: session.sub },
        create: {
          userId: session.sub,
          entityType: d.entityType,
          companyName: d.companyName,
          companyRegNumber: d.companyRegNumber,
          taxNumber: d.taxNumber,
          businessAddress: d.businessAddress,
          contactPhone: d.phone,
        },
        update: {
          entityType: d.entityType,
          companyName: d.companyName,
          companyRegNumber: d.companyRegNumber,
          taxNumber: d.taxNumber,
          businessAddress: d.businessAddress,
          contactPhone: d.phone,
        },
      }),
    ]);

    // Sign fresh token with onboardingCompleted: true
    const token = await signSession({
      sub: updatedUser.id,
      role: updatedUser.role,
      emailVerified: true,
      onboardingCompleted: true,
      onboardingStep: 1,
    });

    const res = NextResponse.json({
      success: true,
      onboardingCompleted: true,
      redirect: "/dashboard/landlord",
    });

    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err: any) {
    console.error("Landlord onboarding error:", err);
    return NextResponse.json({ error: err?.message || "Failed to complete landlord profile" }, { status: 500 });
  }
}
