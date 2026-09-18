import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signSession, SESSION_COOKIE } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  // Deliberately generic error for both "no such user" and "wrong password" —
  // distinguishing them lets an attacker enumerate registered emails.
  const genericError = NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  if (!user || !user.passwordHash) return genericError;
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return genericError;

  if (!user.emailVerifiedAt) {
    const { generateOtp, hashOtp, otpExpiryDate } = await import("@/lib/otp");
    const { sendOtpEmail } = await import("@/lib/email");

    let shouldSend = true;
    if (user.lastOtpSentAt) {
      const secondsSince = Math.floor((Date.now() - new Date(user.lastOtpSentAt).getTime()) / 1000);
      if (secondsSince < 60) {
        shouldSend = false;
      }
    }

    if (shouldSend || !user.otpCodeHash || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      const freshOtp = generateOtp();
      const freshOtpHash = await hashOtp(freshOtp);
      const freshExpires = otpExpiryDate();

      await prisma.user.update({
        where: { id: user.id },
        data: {
          otpCodeHash: freshOtpHash,
          otpExpiresAt: freshExpires,
          otpAttempts: 0,
          lastOtpSentAt: new Date(),
        },
      });

      await sendOtpEmail({
        to: user.email,
        code: freshOtp,
        name: user.name,
        role: user.role,
      }).catch((err) => console.warn("Login unverified email dispatch warning:", err));
    }

    return NextResponse.json(
      {
        error: "Please verify your email address using the 6-digit code sent to your inbox before logging in.",
        needsVerification: true,
        email: user.email,
        role: user.role,
      },
      { status: 403 }
    );
  }


  const token = await signSession({
    sub: user.id,
    role: user.role,
    emailVerified: !!user.emailVerifiedAt,
    onboardingCompleted: user.onboardingCompleted,
    onboardingStep: user.onboardingStep,
  });

  const res = NextResponse.json({
    user: {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      onboardingCompleted: user.onboardingCompleted,
      onboardingStep: user.onboardingStep,
    },
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
