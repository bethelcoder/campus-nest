import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { evaluateSafetyScore } from "@/lib/safety-engine";

const requestSchema = z.object({
  applicationId: z.string().min(1),
  funderEmail: z.string().email().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Only students can request funder letters" }, { status: 403 });
  }

  const parsed = requestSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const application = await prisma.application.findFirst({
    where: { id: parsed.data.applicationId, studentId: session.sub },
    include: {
      student: { include: { studentProfile: true } },
      property: { include: { checklistItems: true } },
      funderLetterRequest: true,
    },
  });

  if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });
  if (application.funderLetterRequest) {
    return NextResponse.json({ request: application.funderLetterRequest }, { status: 200 });
  }
  if (application.property.status !== "VERIFIED") {
    return NextResponse.json({ error: "This residence is not accredited yet" }, { status: 409 });
  }
  if (!application.property.physicalInspectionAt || !application.property.physicalInspectorName) {
    return NextResponse.json(
      { error: "A physical CampusNest inspection has not been recorded for this residence yet" },
      { status: 409 }
    );
  }

  const checklistItems = application.property.checklistItems;
  const passedCount = checklistItems.filter((item) => item.passed === true).length;
  if (!checklistItems.length || passedCount !== checklistItems.length) {
    return NextResponse.json(
      { error: "This residence must pass every safety and compliance checkpoint before a letter can be requested" },
      { status: 409 }
    );
  }

  const evaluation = evaluateSafetyScore(
    checklistItems.map((item) => ({
      checkpointId: item.label.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 24),
      passed: item.passed,
    }))
  );

  const request = await prisma.funderLetterRequest.create({
    data: {
      applicationId: application.id,
      studentId: application.studentId,
      propertyId: application.propertyId,
      funderEmail: parsed.data.funderEmail || application.student.studentProfile?.funderContactEmail,
      physicalInspectionAt: application.property.physicalInspectionAt,
      physicalInspectorName: application.property.physicalInspectorName,
      accreditationReference: application.property.accreditationReference,
      safetyScore: application.property.safetyScore || evaluation.rawScore / 10,
      checklistPassed: passedCount,
      checklistTotal: checklistItems.length,
    },
  });

  return NextResponse.json({ request }, { status: 201 });
}
