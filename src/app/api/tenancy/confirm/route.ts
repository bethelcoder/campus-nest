import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const confirmSchema = z.object({
  studentId: z.string(),
  propertyId: z.string(),
  startDate: z.string(), // ISO date
  endDate: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") {
    return NextResponse.json({ error: "Only landlords can confirm tenancies" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { studentId, propertyId, startDate, endDate } = parsed.data;

  const [property, student] = await Promise.all([
    prisma.property.findUnique({ where: { id: propertyId } }),
    prisma.user.findUnique({ where: { id: studentId } }),
  ]);

  if (!property || property.landlordId !== session.sub) {
    return NextResponse.json({ error: "Property not found or not yours" }, { status: 404 });
  }
  if (property.status !== "VERIFIED") {
    return NextResponse.json(
      { error: "Property safety checklist must be complete and VERIFIED before confirming a tenancy" },
      { status: 409 }
    );
  }
  if (!student || student.role !== "STUDENT" || !student.emailVerifiedAt) {
    return NextResponse.json(
      { error: "Student must have a verified university email before tenancy can be confirmed" },
      { status: 409 }
    );
  }

  // Tenancy has no natural unique key (studentId+propertyId isn't unique —
  // a student could have separate historical tenancies at the same
  // property), so re-activate an existing non-ended tenancy for this pair
  // instead of using upsert, which would need a unique `where` we don't have.
  const existing = await prisma.tenancy.findFirst({
    where: { studentId, propertyId, status: { not: "ENDED" } },
  });

  const tenancy = existing
    ? await prisma.tenancy.update({
        where: { id: existing.id },
        data: { status: "ACTIVE", startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : undefined },
      })
    : await prisma.tenancy.create({
        data: {
          studentId,
          propertyId,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : undefined,
          status: "ACTIVE",
        },
      });

  return NextResponse.json({ tenancy, nextStep: "generate-confirmation-letter" }, { status: 201 });
}
