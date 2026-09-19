import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const favoriteSchema = z.object({ propertyId: z.string().min(1) });

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { studentId: session.sub },
    orderBy: { createdAt: "desc" },
    include: {
      property: {
        include: {
          landlord: { include: { landlordProfile: true } },
          checklistItems: { select: { passed: true } },
        },
      },
    },
  });

  return NextResponse.json({ favorites, count: favorites.length });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") return NextResponse.json({ error: "Only students can save residences" }, { status: 403 });
  const parsed = favoriteSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const property = await prisma.property.findFirst({ where: { id: parsed.data.propertyId, status: "VERIFIED" } });
  if (!property) return NextResponse.json({ error: "Accredited residence not found" }, { status: 404 });

  const existing = await prisma.favorite.findUnique({ where: { studentId_propertyId: { studentId: session.sub, propertyId: property.id } } });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    const count = await prisma.favorite.count({ where: { studentId: session.sub } });
    return NextResponse.json({ saved: false, count });
  }
  await prisma.favorite.create({ data: { studentId: session.sub, propertyId: property.id } });
  const count = await prisma.favorite.count({ where: { studentId: session.sub } });
  return NextResponse.json({ saved: true, count });
}