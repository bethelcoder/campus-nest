import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { calculateSafetyScore, isChecklistComplete } from "@/lib/safety";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: { checklistItems: true, landlord: { select: { name: true, surname: true } } },
  });
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ property });
}

const checklistUpdateSchema = z.object({
  checklistAnswers: z.array(
    z.object({
      id: z.string(),
      passed: z.boolean(),
      notes: z.string().optional(),
    })
  ),
});

// Landlord submits/updates checklist answers. Safety score is recalculated
// server-side on every save — never trust a client-submitted score, since
// that field directly drives the public "verified safe" signal.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const property = await prisma.property.findUnique({ where: { id: params.id } });
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (property.landlordId !== session.sub) {
    return NextResponse.json({ error: "Not your property" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = checklistUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.checklistAnswers.map((answer) =>
      prisma.checklistItem.update({
        where: { id: answer.id },
        data: { passed: answer.passed, notes: answer.notes },
      })
    )
  );

  const allItems = await prisma.checklistItem.findMany({ where: { propertyId: params.id } });
  const safetyScore = calculateSafetyScore(allItems);
  const complete = isChecklistComplete(allItems);

  const updated = await prisma.property.update({
    where: { id: params.id },
    data: {
      safetyScore,
      status: complete ? "VERIFIED" : "PENDING_VERIFICATION",
    },
    include: { checklistItems: true },
  });

  return NextResponse.json({ property: updated });
}
