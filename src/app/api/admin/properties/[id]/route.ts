import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const statusUpdateSchema = z.object({
  status: z.enum(["VERIFIED", "FLAGGED", "REJECTED", "PENDING_VERIFICATION", "DRAFT"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Only platform admins can update property status" }, { status: 403 });
  }

  const property = await prisma.property.findUnique({ where: { id: params.id } });
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = statusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { status } = parsed.data;

  // Prevent accrediting properties that haven't completed safety checklist
  if (status === "VERIFIED" && property.safetyScore === null) {
    return NextResponse.json(
      { error: "Cannot accredit a property without a completed safety checklist score" },
      { status: 409 }
    );
  }

  const updated = await prisma.property.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json({ property: updated });
}
