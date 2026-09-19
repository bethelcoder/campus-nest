import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyOtp, generateOtp, hashOtp, otpExpiryDate } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { signSession, SESSION_COOKIE } from "@/lib/auth";

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

const MAX_OTP_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

// GET: Retrieve accurate remaining cooldown from the database truth
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Email parameter required" }, { status: 400 });
    }
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { universityEmail: normalizedEmail },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json({ verified: true, role: user.role });
    }

    // Calculate remaining seconds from DB timestamp
    let remainingCooldown = 0;
    if (user.lastOtpSentAt) {
      const secondsSince = Math.floor((Date.now() - new Date(user.lastOtpSentAt).getTime()) / 1000);
      remainingCooldown = Math.max(0, RESEND_COOLDOWN_SECONDS - secondsSince);
    }

    const hasActiveOtp = !!(user.otpCodeHash && user.otpExpiresAt && user.otpExpiresAt > new Date());

    // If no active OTP exists and cooldown is zero, dispatch one automatically
    if (!hasActiveOtp && remainingCooldown === 0) {
      const otp = generateOtp();
      const otpHash = await hashOtp(otp);
      const expiresAt = otpExpiryDate();

      await prisma.user.update({
        where: { id: user.id },
        data: {
          otpCodeHash: otpHash,
          otpExpiresAt: expiresAt,
          otpAttempts: 0,
          lastOtpSentAt: new Date(),
        },
      });

      try {
        await sendOtpEmail({
          to: user.email,
          code: otp,
          name: user.name,
          role: user.role,
        });
      } catch (err) {
        console.warn("Auto-dispatch email warning:", err);
      }

      remainingCooldown = RESEND_COOLDOWN_SECONDS;
    }

    return NextResponse.json({
      email: user.email,
      role: user.role,
      remainingCooldown,
      hasActiveOtp: true,
      lastOtpSentAt: user.lastOtpSentAt,
    });
  } catch (err: any) {
    console.error("GET verify-otp error:", err);
    return NextResponse.json({ error: "Could not retrieve verification status" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Please enter a valid 6-digit verification code" }, { status: 400 });
    }
    const { email, code } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { universityEmail: normalizedEmail },
        ],
      },
    });

    if (!user || !user.otpCodeHash || !user.otpExpiresAt) {
      return NextResponse.json({ error: "No active verification code found. Please request a new one." }, { status: 400 });
    }

    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please request a fresh code." },
        { status: 429 }
      );
    }

    if (user.otpExpiresAt < new Date()) {
      return NextResponse.json({ error: "Verification code has expired. Click 'Resend code' to get a new one." }, { status: 400 });
    }

    const valid = await verifyOtp(code, user.otpCodeHash);
    if (!valid) {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { otpAttempts: { increment: 1 } },
      });
      const remaining = MAX_OTP_ATTEMPTS - updated.otpAttempts;
      return NextResponse.json({
        error: `Incorrect verification code. ${remaining > 0 ? `${remaining} attempt${remaining > 1 ? "s" : ""} left.` : "Please request a new code."}`
      }, { status: 400 });
    }

    const isSrc = user.role === "SRC_REPRESENTATIVE";

    // Mark user as verified and clear OTP
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        onboardingCompleted: isSrc ? true : user.onboardingCompleted,
        otpCodeHash: null,
        otpExpiresAt: null,
        otpAttempts: 0,
      },
    });

    // Sign session token so user is automatically authenticated
    const sessionToken = await signSession({
      sub: updatedUser.id,
      role: updatedUser.role,
      emailVerified: true,
      onboardingCompleted: updatedUser.onboardingCompleted,
      onboardingStep: updatedUser.onboardingStep,
    });

    // Determine target destination
    const targetUrl = isSrc
      ? "/dashboard/src"
      : updatedUser.role === "ADMIN"
      ? "/dashboard/admin"
      : updatedUser.role === "LANDLORD"
      ? updatedUser.onboardingCompleted ? "/dashboard/landlord" : "/landlord/onboarding"
      : updatedUser.onboardingCompleted ? "/dashboard/student" : "/onboarding";

    const res = NextResponse.json({
      verified: true,
      user: {
        id: updatedUser.id,
        role: updatedUser.role,
        email: updatedUser.email,
        name: updatedUser.name,
        onboardingCompleted: updatedUser.onboardingCompleted,
        onboardingStep: updatedUser.onboardingStep,
      },
      targetUrl,
    });

    res.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err: any) {
    console.error("Verify OTP error:", err);
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
  }
}

// Resend a fresh 6-digit OTP with 60-second rate limiter
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = z.object({ email: z.string().email() }).parse(body);
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          { universityEmail: normalizedEmail },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Rate Limiting Cooldown Check
    if (user.lastOtpSentAt) {
      const secondsSinceLastOtp = Math.floor((Date.now() - new Date(user.lastOtpSentAt).getTime()) / 1000);
      if (secondsSinceLastOtp < RESEND_COOLDOWN_SECONDS) {
        const remaining = RESEND_COOLDOWN_SECONDS - secondsSinceLastOtp;
        return NextResponse.json(
          {
            error: `Please wait ${remaining}s before requesting a new code.`,
            retryAfter: remaining,
          },
          { status: 429 }
        );
      }
    }

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = otpExpiryDate();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCodeHash: otpHash,
        otpExpiresAt: expiresAt,
        otpAttempts: 0,
        lastOtpSentAt: new Date(),
      },
    });

    try {
      await sendOtpEmail({
        to: user.email,
        code: otp,
        name: user.name,
        role: user.role,
      });
    } catch (err) {
      console.error("Resend email error:", err);
      return NextResponse.json({ error: "Verification email could not be sent. Please try again later." }, { status: 502 });
    }

    return NextResponse.json({
      sent: true,
      message: `A fresh 6-digit code has been sent to ${user.email}`,
    });
  } catch (err: any) {
    console.error("Resend OTP error:", err);
    return NextResponse.json({ error: "Could not resend code. Please try again." }, { status: 500 });
  }
}

