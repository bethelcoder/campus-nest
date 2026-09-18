import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const updateSchema = z.object({
  applicationId: z.string(),
  status: z.enum(["ACCEPTED", "REJECTED"]),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const applications = await prisma.application.findMany({
    where: { property: { landlordId: session.sub } },
    orderBy: { createdAt: "desc" },
    include: {
      student: { include: { studentProfile: true } },
      property: true,
      roomListing: true,
    },
  });
  return NextResponse.json({ applications });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const parsed = updateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const application = await prisma.application.findFirst({
    where: { id: parsed.data.applicationId, property: { landlordId: session.sub } },
    include: { roomListing: true, property: true },
  });
  if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  let roomListing = application.roomListing;

  // If accepting and no roomListing is attached, find or create one automatically
  if (parsed.data.status === "ACCEPTED" && !roomListing) {
    const existingRoom = await prisma.roomListing.findFirst({
      where: { propertyId: application.propertyId },
    });

    if (existingRoom) {
      roomListing = existingRoom;
    } else {
      roomListing = await prisma.roomListing.create({
        data: {
          propertyId: application.propertyId,
          name: "Standard Student Unit",
          roomType: "Single Room",
          monthlyRent: application.property.priceMonthly,
          availableUnits: 10,
        },
      });
    }

    await prisma.application.update({
      where: { id: application.id },
      data: { roomListingId: roomListing.id },
    });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.application.update({
      where: { id: application.id },
      data: { status: parsed.data.status },
    });

    if (parsed.data.status === "ACCEPTED" && roomListing) {
      if (roomListing.availableUnits > 0) {
        await tx.roomListing.update({
          where: { id: roomListing.id },
          data: { availableUnits: { decrement: 1 } },
        });
      }

      const existingTenancy = await tx.tenancy.findFirst({
        where: { studentId: application.studentId, propertyId: application.propertyId },
      });

      if (existingTenancy) {
        await tx.tenancy.update({
          where: { id: existingTenancy.id },
          data: {
            roomListingId: roomListing.id,
            roomName: roomListing.name,
            roomType: roomListing.roomType,
            monthlyRent: roomListing.monthlyRent,
            status: "ACTIVE",
          },
        });
      } else {
        await tx.tenancy.create({
          data: {
            studentId: application.studentId,
            propertyId: application.propertyId,
            roomListingId: roomListing.id,
            roomName: roomListing.name,
            roomType: roomListing.roomType,
            monthlyRent: roomListing.monthlyRent,
            status: "ACTIVE",
            startDate: new Date(),
          },
        });
      }
    }
    return result;
  });

  return NextResponse.json({ application: updated });
}
