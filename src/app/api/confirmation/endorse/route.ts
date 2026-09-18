import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const endorseSchema = z.object({
  letterId: z.string(),
  decision: z.enum(["ENDORSE", "REJECT"]),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  const isAdmin = session?.role === "ADMIN";
  if (!session || !isAdmin) {
    return NextResponse.json({ error: "Only an admin can endorse letters" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = endorseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const letter = await prisma.confirmationLetter.findUnique({ where: { id: parsed.data.letterId } });
  if (!letter) return NextResponse.json({ error: "Letter not found" }, { status: 404 });
  if (letter.status !== "PENDING_REVIEW") {
    return NextResponse.json({ error: `Letter is already ${letter.status}` }, { status: 409 });
  }

  const updated = await prisma.confirmationLetter.update({
    where: { id: letter.id },
    data:
      parsed.data.decision === "ENDORSE"
        ? { status: "ENDORSED", endorsedByAdminId: session.sub, endorsedAt: new Date() }
        : { status: "REJECTED" },
  });

  return NextResponse.json({ letter: updated });
}
