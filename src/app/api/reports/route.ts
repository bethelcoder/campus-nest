import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendMaintenanceReportEmail } from "@/lib/email";

const reportSchema = z.object({
  propertyId: z.string(),
  subject: z.string().trim().min(3),
  description: z.string().trim().min(10),
  type: z.enum(["STANDARD_MAINTENANCE", "RIGHTS_VIOLATION_CRISIS"]).default("STANDARD_MAINTENANCE"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL_EMERGENCY"]).default("MEDIUM"),
  category: z.string().trim().min(1).optional(),
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

  const tenancy = await prisma.tenancy.findFirst({
    where: {
      studentId: session.sub,
      propertyId: parsed.data.propertyId,
      status: "ACTIVE",
    },
    include: {
      property: { include: { landlord: { select: { name: true, surname: true, email: true } } } },
      student: { select: { name: true, surname: true } },
    },
  });

  if (!tenancy) {
    return NextResponse.json(
      { error: "You can only report issues for a residence where you have an active tenancy" },
      { status: 403 }
    );
  }

  const report = await prisma.safetyReport.create({
    data: {
      propertyId: parsed.data.propertyId,
      reporterId: session.sub,
      subject: parsed.data.subject,
      description: parsed.data.description,
      type: parsed.data.type,
      severity: parsed.data.severity,
      category: parsed.data.category,
      slaHours: parsed.data.severity === "CRITICAL_EMERGENCY" ? 4 : parsed.data.severity === "HIGH" ? 24 : 48,
      slaExpiresAt: new Date(Date.now() + (parsed.data.severity === "CRITICAL_EMERGENCY" ? 4 : parsed.data.severity === "HIGH" ? 24 : 48) * 60 * 60 * 1000),
    },
  });

  try {
    await sendMaintenanceReportEmail({
      to: tenancy.property.landlord.email,
      landlordName: `${tenancy.property.landlord.name} ${tenancy.property.landlord.surname}`,
      studentName: `${tenancy.student.name} ${tenancy.student.surname}`,
      propertyTitle: tenancy.property.title,
      subject: report.subject,
      description: report.description,
      severity: report.severity,
      reportId: report.id,
    });
  } catch (error) {
    console.error("Maintenance report created, but landlord email notification failed:", error);
  }

  return NextResponse.json({ report }, { status: 201 });
}
