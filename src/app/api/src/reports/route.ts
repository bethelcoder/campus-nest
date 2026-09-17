import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const updateSchema = z.object({
  reportId: z.string().min(1),
  status: z.enum(["UNDER_INTERVENTION", "RESOLVED"]),
  actionNotes: z.string().trim().min(3).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SRC_REPRESENTATIVE") {
    return NextResponse.json({ error: "Only SRC representatives can view escalated reports" }, { status: 403 });
  }

  const reports = await prisma.safetyReport.findMany({
    where: { status: { in: ["UNDER_INTERVENTION", "ESCALATED"] } },
    orderBy: [{ severity: "desc" }, { createdAt: "asc" }],
    include: {
      reporter: { include: { studentProfile: true } },
      property: { include: { landlord: { select: { name: true, surname: true, email: true } } } },
    },
  });

  return NextResponse.json({
    reports: reports.map((report) => ({
      id: report.id,
      subject: report.subject,
      description: report.description,
      type: report.type,
      severity: report.severity,
      status: report.status,
      category: report.category,
      actionNotes: report.actionNotes,
      createdAt: report.createdAt.toISOString(),
      slaExpiresAt: report.slaExpiresAt?.toISOString() || null,
      student: {
        name: `${report.reporter.name} ${report.reporter.surname}`,
        studentNumber: report.reporter.studentProfile?.studentNumber || "Not provided",
        institution: report.reporter.studentProfile?.universityName || "Not provided",
        email: report.reporter.email,
      },
      property: {
        title: report.property.title,
        address: `${report.property.address}, ${report.property.suburb}, ${report.property.city}`,
        landlord: `${report.property.landlord.name} ${report.property.landlord.surname}`,
      },
    })),
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "SRC_REPRESENTATIVE") {
    return NextResponse.json({ error: "Only SRC representatives can update reports" }, { status: 403 });
  }

  const parsed = updateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const report = await prisma.safetyReport.findUnique({ where: { id: parsed.data.reportId } });
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
  if (report.status !== "UNDER_INTERVENTION" && report.status !== "ESCALATED") {
    return NextResponse.json({ error: "Only escalated reports can be managed here" }, { status: 409 });
  }

  const updated = await prisma.safetyReport.update({
    where: { id: report.id },
    data: {
      status: parsed.data.status,
      actionNotes: parsed.data.actionNotes || report.actionNotes,
      resolvedAt: parsed.data.status === "RESOLVED" ? new Date() : null,
    },
  });

  return NextResponse.json({ report: updated });
}