import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";
import { signSession, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return NextResponse.redirect(
      new URL("/src/login?error=" + encodeURIComponent("Invalid verification link. Please sign in or request a new link."), req.url)
    );
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { universityEmail: email.toLowerCase() },
        ],
        role: "SRC_REPRESENTATIVE",
      },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/src/login?error=" + encodeURIComponent("SRC account not found. Please register."), req.url)
      );
    }

    // Check if token matches
    let isValid = false;
    if (user.otpCodeHash) {
      isValid = await verifyOtp(token, user.otpCodeHash);
    } else if (user.emailVerifiedAt) {
      // Already verified
      isValid = true;
    }

    if (!isValid) {
      return NextResponse.redirect(
        new URL("/src/login?error=" + encodeURIComponent("Verification token expired or invalid."), req.url)
      );
    }

    // Update user to verified + completed onboarding (zero onboarding for SRC)
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        onboardingCompleted: true,
        onboardingStep: 1,
        otpCodeHash: null,
        otpExpiresAt: null,
      },
    });

    // Sign session cookie
    const sessionToken = await signSession({
      sub: updatedUser.id,
      role: "SRC_REPRESENTATIVE",
      emailVerified: true,
      onboardingCompleted: true,
      onboardingStep: 1,
    });

    const res = NextResponse.redirect(new URL("/dashboard/src", req.url));

    res.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err: any) {
    console.error("SRC verification error:", err);
    return NextResponse.redirect(
      new URL("/src/login?error=" + encodeURIComponent("Verification error. Please try logging in."), req.url)
    );
  }
}
