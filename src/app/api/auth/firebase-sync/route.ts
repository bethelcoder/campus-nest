import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signSession, SESSION_COOKIE } from "@/lib/auth";

const syncSchema = z.object({
  email: z.string().email(),
  name: z.string().optional().default(""),
  surname: z.string().optional().default(""),
  uid: z.string().min(1),
  photoURL: z.string().optional().nullable(),
  role: z.enum(["STUDENT", "LANDLORD", "SRC_REPRESENTATIVE"]).default("STUDENT"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = syncSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { email, name, surname, uid, role } = parsed.data;

    // Check if user already exists by email or firebaseUid
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { firebaseUid: uid }],
      },
      include: {
        studentProfile: true,
        landlordProfile: true,
      },
    });

    if (!user) {
      // First-time registration with Firebase
      const parsedName = name || (email.split("@")[0] || "User");
      const parsedSurname = surname || "";

      user = await prisma.user.create({
        data: {
          email,
          name: parsedName,
          surname: parsedSurname,
          role,
          firebaseUid: uid,
          onboardingCompleted: false,
          onboardingStep: 1,
          studentProfile: role === "STUDENT" ? { create: {} } : undefined,
          landlordProfile: role === "LANDLORD" ? { create: {} } : undefined,
        },
        include: {
          studentProfile: true,
          landlordProfile: true,
        },
      });
    } else {
      // Existing user: ensure firebaseUid is linked
      if (!user.firebaseUid) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { firebaseUid: uid },
          include: {
            studentProfile: true,
            landlordProfile: true,
          },
        });
      }

      // Ensure profile exists if user was created earlier without one
      if (user.role === "STUDENT" && !user.studentProfile) {
        const studentProfile = await prisma.studentProfile.create({ data: { userId: user.id } });
        user = { ...user, studentProfile };
      } else if (user.role === "LANDLORD" && !user.landlordProfile) {
        const landlordProfile = await prisma.landlordProfile.create({ data: { userId: user.id } });
        user = { ...user, landlordProfile };
      }
    }

    // Sign session token
    const token = await signSession({
      sub: user.id,
      role: user.role,
      emailVerified: true,
      onboardingCompleted: user.onboardingCompleted,
      onboardingStep: user.onboardingStep,
    });

    const nextStep = user.role === "SRC_REPRESENTATIVE"
      ? "/dashboard/src"
      : !user.onboardingCompleted
      ? user.role === "LANDLORD"
        ? "/landlord/onboarding"
        : "/onboarding"
      : user.role === "LANDLORD"
      ? "/dashboard/landlord"
      : "/dashboard/student";

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        onboardingCompleted: user.onboardingCompleted,
        onboardingStep: user.onboardingStep,
      },
      nextStep,
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
    console.error("Firebase sync error details:", err);
    return NextResponse.json({ 
      error: err?.message || "Failed to authenticate session." 
    }, { status: 500 });
  }
}
