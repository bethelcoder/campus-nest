import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const generateSchema = z.object({
  tenancyId: z.string(),
  funderEmail: z.string().email().optional(),
});

// Trigger per PRD: "Student verified + Property verified + Tenancy marked
// active". All three are re-checked here server-side rather than trusted
// from the request — the PDF is a legal-ish document, so it should only
// ever be generated from data the server itself has confirmed.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "LANDLORD" && session.role !== "UNIVERSITY_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = generateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const tenancy = await prisma.tenancy.findUnique({
    where: { id: parsed.data.tenancyId },
    include: {
      student: true,
      property: true,
      confirmationLetter: true,
    },
  });

  if (!tenancy) return NextResponse.json({ error: "Tenancy not found" }, { status: 404 });
  if (tenancy.status !== "ACTIVE") {
    return NextResponse.json({ error: "Tenancy is not ACTIVE" }, { status: 409 });
  }
  if (tenancy.property.status !== "VERIFIED") {
    return NextResponse.json({ error: "Property is not VERIFIED" }, { status: 409 });
  }
  if (!tenancy.student.emailVerifiedAt) {
    return NextResponse.json({ error: "Student email is not verified" }, { status: 409 });
  }
  if (tenancy.confirmationLetter) {
    return NextResponse.json(
      { error: "A confirmation letter already exists for this tenancy", letter: tenancy.confirmationLetter },
      { status: 409 }
    );
  }

  const letter = await prisma.confirmationLetter.create({
    data: {
      tenancyId: tenancy.id,
      studentId: tenancy.studentId,
      studentName: `${tenancy.student.name} ${tenancy.student.surname}`,
      studentEmail: tenancy.student.email,
      propertyAddress: `${tenancy.property.address}, ${tenancy.property.suburb}`,
      safetyScore: tenancy.property.safetyScore,
      funderEmail: parsed.data.funderEmail,
      status: "PENDING_REVIEW",
    },
  });

  // The PDF itself is generated at send-time (see /api/confirmation/send),
  // not here — persisting a rendered buffer or file to blob storage for a
  // letter that might still be rejected on admin review is unnecessary
  // work for a 4-day build. Regenerating from the DB record is cheap and
  // guarantees the PDF always reflects the latest endorsement state.

  return NextResponse.json({ letter }, { status: 201 });
}
