import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const roomSchema = z.object({
  name: z.string().trim().min(1),
  roomType: z.string().trim().min(1),
  description: z.string().trim().optional(),
  monthlyRent: z.coerce.number().positive(),
  availableUnits: z.coerce.number().int().nonnegative(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const rooms = await prisma.roomListing.findMany({
    where: { propertyId: params.id, property: { status: "VERIFIED" } },
    orderBy: { monthlyRent: "asc" },
  });
  return NextResponse.json({ rooms });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const property = await prisma.property.findFirst({ where: { id: params.id, landlordId: session.sub } });
  if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });
  const parsed = roomSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const room = await prisma.roomListing.create({ data: { propertyId: property.id, ...parsed.data } });
  return NextResponse.json({ room }, { status: 201 });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const parsedBody = await req.json().catch(() => ({}));
  const roomId = z.string().safeParse(parsedBody.roomId);
  const parsed = roomSchema.partial().safeParse(parsedBody);
  if (!roomId.success || !parsed.success) return NextResponse.json({ error: "Invalid room update" }, { status: 400 });
  const room = await prisma.roomListing.updateMany({ where: { id: roomId.data, property: { landlordId: session.sub, id: params.id } }, data: parsed.data });
  if (!room.count) return NextResponse.json({ error: "Room listing not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
