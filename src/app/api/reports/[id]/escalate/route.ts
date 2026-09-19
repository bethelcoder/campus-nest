import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendSrcEscalationEmail } from "@/lib/email";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Only students can escalate reports" }, { status: 403 });
  }

  const report = await prisma.safetyReport.findFirst({
    where: { id: params.id, reporterId: session.sub },
    include: {
      property: { include: { landlord: { select: { name: true, surname: true } } } },
      reporter: { select: { name: true, surname: true } },
    },
  });
  if (!report) return NextResponse.json({ error: "Report not found" }, { status: 404 });
  if (report.status === "RESOLVED") {
    return NextResponse.json({ error: "A resolved report cannot be escalated" }, { status: 409 });
  }
  if (report.status === "UNDER_INTERVENTION" || report.status === "ESCALATED") {
    return NextResponse.json({ report });
  }

  const updated = await prisma.safetyReport.update({
    where: { id: report.id },
    data: {
      status: "ESCALATED",
      type: "RIGHTS_VIOLATION_CRISIS",
      severity: "CRITICAL_EMERGENCY",
      slaHours: 4,
      slaExpiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      actionNotes: "Escalated by student to the SRC for review and intervention.",
    },
  });

  const representatives = await prisma.user.findMany({
    where: { role: "SRC_REPRESENTATIVE" },
    select: { email: true },
  });
  if (representatives.length) {
    try {
      await sendSrcEscalationEmail({
        to: representatives.map((representative) => representative.email),
        studentName: `${report.reporter.name} ${report.reporter.surname}`,
        propertyTitle: report.property.title,
        subject: report.subject,
        description: report.description,
        reportId: report.id,
      });
    } catch (error) {
      console.error("Report escalated, but SRC email notification failed:", error);
    }
  }

  return NextResponse.json({ report: updated });
}