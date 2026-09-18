import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, formatSrcAlias } from "@/lib/auth";
import { generateOtp, hashOtp, otpExpiryDate, isAllowedUniversityDomain } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

const registerSchema = z.object({
  role: z.enum(["STUDENT", "LANDLORD", "SRC_REPRESENTATIVE"]), // university admins are provisioned manually
  name: z.string().optional().default(""),
  surname: z.string().optional().default(""),
  idNumber: z.string().min(6).optional(),
  email: z.string().email(),
  universityEmail: z.string().email().optional(),
  institutionName: z.string().trim().min(2).optional(),
  phone: z.string().optional(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const data = parsed.data;

    const isSrc = data.role === "SRC_REPRESENTATIVE";
    const loginEmail = isSrc ? (data.universityEmail || data.email).toLowerCase() : data.email.toLowerCase();

    if (isSrc) {
      if (!loginEmail) {
        return NextResponse.json(
          { error: "SRC registration requires an official university domain email" },
          { status: 400 }
        );
      }
      if (!data.institutionName) {
        data.institutionName = "University of the Witwatersrand (Wits)";
      }
    }

    if (data.role === "STUDENT" && data.universityEmail && !isAllowedUniversityDomain(data.universityEmail)) {
      return NextResponse.json(
        { error: "That email domain is not on the recognised university list" },
        { status: 400 }
      );
    }

    const alias = isSrc ? formatSrcAlias(data.institutionName || "") : { name: data.name, surname: data.surname };
    const finalName = (!isSrc && data.name && data.name.trim().length > 0) ? data.name : alias.name;
    const finalSurname = (!isSrc && data.surname && data.surname.trim().length > 0) ? data.surname : alias.surname;

    // Check if account exists with email or universityEmail
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginEmail },
          { universityEmail: loginEmail },
          ...(data.universityEmail ? [{ universityEmail: data.universityEmail.toLowerCase() }] : []),
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in or use another email." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(data.password);

    // Universal 6-Digit Cryptographic OTP
    const verificationCode = generateOtp();
    const otpCodeHash = await hashOtp(verificationCode);
    const otpExpiresAt = otpExpiryDate();
    const lastOtpSentAt = new Date();

    const user = await prisma.user.create({
      data: {
        role: data.role,
        name: finalName,
        surname: finalSurname,
        idNumber: data.idNumber,
        email: loginEmail,
        universityEmail: isSrc ? loginEmail : data.universityEmail?.toLowerCase(),
        institutionName: isSrc ? (data.institutionName || "University of the Witwatersrand (Wits)") : data.institutionName,
        phone: data.phone,
        passwordHash,
        otpCodeHash,
        otpExpiresAt,
        otpAttempts: 0,
        lastOtpSentAt,
        onboardingCompleted: false,
        onboardingStep: 1,
        studentProfile: data.role === "STUDENT" ? { create: {} } : undefined,
        landlordProfile: data.role === "LANDLORD" ? { create: {} } : undefined,
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

    // Send 6-digit OTP email via Brevo
    await sendOtpEmail({
      to: loginEmail,
      code: verificationCode,
      name: finalName,
      role: data.role,
    }).catch((err) => console.warn("Email dispatch error:", err));

    return NextResponse.json(
      {
        user,
        nextStep: "verify-otp",
        email: loginEmail,
        role: data.role,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: err?.message || "Registration encountered an error. Please try again." },
      { status: 500 }
    );
  }
}


