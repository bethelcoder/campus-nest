import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const updateReportSchema = z.object({
  status: z.enum(["OPEN", "UNDER_INTERVENTION", "RESOLVED", "ESCALATED"]).optional(),
  actionNotes: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const report = await prisma.safetyReport.findUnique({
    where: { id: params.id },
    include: { property: true },
  });

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  // Only the landlord owning this property, or University Admin / SRC can update
  if (
    session.role === "LANDLORD" &&
    report.property.landlordId !== session.sub
  ) {
    return NextResponse.json({ error: "Forbidden: Not your property" }, { status: 403 });
  }

  const updateData: any = {};
  if (parsed.data.status) {
    updateData.status = parsed.data.status;
    if (parsed.data.status === "RESOLVED") {
      updateData.resolvedAt = new Date();
    } else if (parsed.data.status === "OPEN" || parsed.data.status === "UNDER_INTERVENTION") {
      updateData.resolvedAt = null;
    }
  }

  if (parsed.data.actionNotes !== undefined) {
    updateData.actionNotes = parsed.data.actionNotes;
  }

  const updatedReport = await prisma.safetyReport.update({
    where: { id: params.id },
    data: updateData,
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          surname: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  return NextResponse.json({ report: updatedReport });
}
