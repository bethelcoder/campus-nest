import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const applySchema = z.object({
  propertyId: z.string(),
  roomListingId: z.string().optional(),
  duration: z.string().optional(),
  message: z.string().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await prisma.application.findMany({
    where: { studentId: session.sub },
    orderBy: { createdAt: "desc" },
    include: {
      property: {
        include: {
          landlord: { include: { landlordProfile: true } },
          checklistItems: { select: { passed: true } },
        },
      },
      roomListing: true,
      funderLetterRequest: true,
    },
  });

  return NextResponse.json({ applications, count: applications.length });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Only students can apply" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = applySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const property = await prisma.property.findFirst({
    where: { id: parsed.data.propertyId, status: "VERIFIED" },
    include: { roomListings: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Accredited residence not found" }, { status: 404 });
  }

  let selectedRoomId = parsed.data.roomListingId;

  // Fallback room selection if none specified
  if (!selectedRoomId) {
    if (property.roomListings.length > 0) {
      selectedRoomId = property.roomListings[0].id;
    } else {
      const newRoom = await prisma.roomListing.create({
        data: {
          propertyId: property.id,
          name: "Standard Student Unit",
          roomType: "Single Room",
          description: "Fully furnished accredited room unit.",
          monthlyRent: property.priceMonthly,
          availableUnits: 10,
        },
      });
      selectedRoomId = newRoom.id;
    }
  }

  const durationStr = parsed.data.duration ? `Duration: ${parsed.data.duration}` : "Duration: 10 Months (Academic Year Feb - Nov)";
  const customMessage = parsed.data.message ? ` Note: ${parsed.data.message}` : "";
  const formattedMessage = `${durationStr}.${customMessage}`;

  const application = await prisma.application.upsert({
    where: { studentId_propertyId: { studentId: session.sub, propertyId: property.id } },
    create: {
      studentId: session.sub,
      propertyId: property.id,
      roomListingId: selectedRoomId,
      message: formattedMessage,
      status: "PENDING",
    },
    update: {
      roomListingId: selectedRoomId,
      message: formattedMessage,
      status: "PENDING",
    },
    include: {
      property: true,
      roomListing: true,
    },
  });

  const count = await prisma.application.count({
    where: { studentId: session.sub },
  });

  return NextResponse.json({ application, count }, { status: 201 });
}
