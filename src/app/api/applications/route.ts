import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const applySchema = z.object({
  propertyId: z.string(),
  message: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Only students can apply" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = applySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const application = await prisma.application.upsert({
    where: { studentId_propertyId: { studentId: session.sub, propertyId: parsed.data.propertyId } },
    create: { studentId: session.sub, propertyId: parsed.data.propertyId, message: parsed.data.message },
    update: { message: parsed.data.message },
  });

  return NextResponse.json({ application }, { status: 201 });
}
