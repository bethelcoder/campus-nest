import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyOtp, generateOtp, hashOtp, otpExpiryDate } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

const MAX_OTP_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { email, code } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.otpCodeHash || !user.otpExpiresAt) {
    return NextResponse.json({ error: "No pending verification for this account" }, { status: 400 });
  }

  if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
    return NextResponse.json(
      { error: "Too many attempts. Request a new code." },
      { status: 429 }
    );
  }

  if (user.otpExpiresAt < new Date()) {
    return NextResponse.json({ error: "Code expired. Request a new one." }, { status: 400 });
  }

  const valid = await verifyOtp(code, user.otpCodeHash);
  if (!valid) {
    await prisma.user.update({
      where: { id: user.id },
      data: { otpAttempts: { increment: 1 } },
    });
    return NextResponse.json({ error: "Incorrect code" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifiedAt: new Date(),
      otpCodeHash: null,
      otpExpiresAt: null,
      otpAttempts: 0,
    },
  });

  return NextResponse.json({ verified: true });
}

// Resend a fresh OTP (old one is invalidated).
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { email } = z.object({ email: z.string().email() }).parse(body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.universityEmail) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const otp = generateOtp();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      otpCodeHash: await hashOtp(otp),
      otpExpiresAt: otpExpiryDate(),
      otpAttempts: 0,
    },
  });
  await sendOtpEmail(user.universityEmail, otp);

  return NextResponse.json({ sent: true });
}
