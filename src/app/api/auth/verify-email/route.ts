import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// The tech doc lists verify-email/route.ts and verify-otp/route.ts as two
// separate endpoints, but the PRD only describes one flow: OTP sent to the
// university email, submitted once. A separate "verify-email" step (e.g. a
// clickable link) isn't in scope, so this route is kept only as a cheap
// status check the frontend can poll/use to decide which screen to show,
// rather than building an unused second verification mechanism.

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email query param required" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerifiedAt: true, universityEmail: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    verified: !!user.emailVerifiedAt,
    universityEmail: user.universityEmail,
  });
}
