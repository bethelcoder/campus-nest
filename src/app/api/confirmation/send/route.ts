import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { generateConfirmationLetterPdf } from "@/lib/pdf";
import { sendConfirmationLetterEmail } from "@/lib/email";

const sendSchema = z.object({
  letterId: z.string(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "UNIVERSITY_ADMIN") {
    return NextResponse.json({ error: "Only a university admin can send letters" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const letter = await prisma.confirmationLetter.findUnique({
    where: { id: parsed.data.letterId },
    include: {
      tenancy: { include: { property: true, student: true } },
      endorsedByAdmin: { select: { name: true, surname: true } },
    },
  });

  if (!letter) return NextResponse.json({ error: "Letter not found" }, { status: 404 });
  if (letter.status !== "ENDORSED") {
    return NextResponse.json(
      { error: "Letter must be ENDORSED by a university admin before it can be sent" },
      { status: 409 }
    );
  }

  const pdfBuffer = await generateConfirmationLetterPdf({
    studentName: letter.studentName,
    studentEmail: letter.studentEmail,
    universityEmail: letter.tenancy.student.universityEmail ?? letter.studentEmail,
    propertyAddress: letter.tenancy.property.address,
    propertyCity: letter.tenancy.property.city,
    safetyScore: letter.safetyScore ? Number(letter.safetyScore) : null,
    tenancyStartDate: letter.tenancy.startDate.toISOString().slice(0, 10),
    tenancyEndDate: letter.tenancy.endDate?.toISOString().slice(0, 10),
    endorsedByName: letter.endorsedByAdmin
      ? `${letter.endorsedByAdmin.name} ${letter.endorsedByAdmin.surname}`
      : undefined,
    endorsedAt: letter.endorsedAt?.toISOString().slice(0, 10),
    letterReference: letter.letterReference,
    issuedDate: letter.issuedDate.toISOString().slice(0, 10),
  });

  const recipients = [letter.studentEmail, letter.funderEmail].filter(
    (e): e is string => !!e
  );

  await sendConfirmationLetterEmail({
    to: recipients,
    studentName: letter.studentName,
    propertyAddress: letter.propertyAddress,
    pdfBuffer,
    letterReference: letter.letterReference,
  });

  const updated = await prisma.confirmationLetter.update({
    where: { id: letter.id },
    data: { status: "SENT_TO_FUNDER", sentToFunderAt: new Date() },
  });

  return NextResponse.json({ letter: updated });
}
