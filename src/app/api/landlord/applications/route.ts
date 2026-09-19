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

  const updated = await prisma.$transaction(async (tx) => {
    const current = await tx.application.findUnique({
      where: { id: application.id },
      include: { roomListing: true, property: true },
    });
    if (!current) throw new Error("APPLICATION_NOT_FOUND");

    if (parsed.data.status === "ACCEPTED" && current.status !== "ACCEPTED") {
      let roomListing = current.roomListing;

      if (!roomListing || roomListing.propertyId !== current.propertyId || roomListing.availableUnits < 1) {
        roomListing = await tx.roomListing.findFirst({
          where: { propertyId: current.propertyId, availableUnits: { gt: 0 } },
          orderBy: { createdAt: "asc" },
        });
      }

      if (!roomListing) {
        throw new Error("NO_AVAILABLE_ROOM");
      }

      const claimedRoom = await tx.roomListing.updateMany({
        where: { id: roomListing.id, propertyId: current.propertyId, availableUnits: { gt: 0 } },
        data: { availableUnits: { decrement: 1 } },
      });
      if (claimedRoom.count !== 1) {
        throw new Error("NO_AVAILABLE_ROOM");
      }

      await tx.application.update({
        where: { id: current.id },
        data: { roomListingId: roomListing.id },
      });

      const existingTenancy = await tx.tenancy.findFirst({
        where: { studentId: current.studentId, propertyId: current.propertyId },
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
            startDate: new Date(),
          },
        });
      } else {
        await tx.tenancy.create({
          data: {
            studentId: current.studentId,
            propertyId: current.propertyId,
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

    const result = await tx.application.update({
      where: { id: current.id },
      data: { status: parsed.data.status },
    });
    return result;
  }).catch((error: unknown) => {
    if (error instanceof Error && error.message === "NO_AVAILABLE_ROOM") {
      return null;
    }
    throw error;
  });

  if (!updated) {
    return NextResponse.json({ error: "No available room matches this application" }, { status: 409 });
  }

  return NextResponse.json({ application: updated });
}
