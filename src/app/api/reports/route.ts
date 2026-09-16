import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const reportSchema = z.object({
  propertyId: z.string(),
  subject: z.string().min(1),
  description: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Only students can submit reports" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const report = await prisma.safetyReport.create({
    data: { ...parsed.data, reporterId: session.sub },
  });

  return NextResponse.json({ report }, { status: 201 });
}
