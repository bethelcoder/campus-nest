import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSession, SESSION_COOKIE } from "@/lib/auth";
import { generateOtp, hashOtp, otpExpiryDate, isAllowedUniversityDomain } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

const registerSchema = z.object({
  role: z.enum(["STUDENT", "LANDLORD"]), // admins are provisioned manually, not self-registered
  name: z.string().min(1),
  surname: z.string().min(1),
  idNumber: z.string().min(6).optional(),
  email: z.string().email(),
  universityEmail: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  if (data.role === "STUDENT" && data.universityEmail && !isAllowedUniversityDomain(data.universityEmail)) {
    return NextResponse.json(
      { error: "That email domain is not on the recognised university list" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(data.password);

  const otp = data.role === "STUDENT" ? generateOtp() : null;
  const otpCodeHash = otp ? await hashOtp(otp) : null;

  const user = await prisma.user.create({
    data: {
      role: data.role,
      name: data.name,
      surname: data.surname,
      idNumber: data.idNumber,
      email: data.email,
      universityEmail: data.universityEmail,
      phone: data.phone,
      passwordHash,
      onboardingCompleted: false,
      onboardingStep: 1,
      studentProfile: data.role === "STUDENT" ? { create: {} } : undefined,
    },
    select: {
      id: true,
      role: true,
      email: true,
      name: true,
      surname: true,
      onboardingCompleted: true,
      onboardingStep: true,
    },
  });

  const token = await signSession({
    sub: user.id,
    role: user.role,
    emailVerified: false,
    onboardingCompleted: false,
    onboardingStep: 1,
  });

  const res = NextResponse.json(
    {
      user,
      nextStep: data.role === "STUDENT" ? "onboarding" : "login",
    },
    { status: 201 }
  );

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
