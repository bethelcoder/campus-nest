import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const updateSchema = z.object({
  applicationId: z.string(),
  status: z.enum(["PENDING", "UNDER_REVIEW", "OFFER_MADE", "ACCEPTED", "REJECTED", "CANCELLED"]),
  proposedBedId: z.string().optional().nullable(),
  offeredRoomName: z.string().optional().nullable(),
  offeredMonthlyRent: z.number().optional().nullable(),
  leaseStartDate: z.string().optional().nullable(),
  leaseEndDate: z.string().optional().nullable(),
  landlordNotes: z.string().optional().nullable(),
  rejectionReason: z.string().optional().nullable(),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "LANDLORD") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

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
  if (!session || session.role !== "LANDLORD") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const parsed = updateSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const application = await prisma.application.findFirst({
    where: { id: parsed.data.applicationId, property: { landlordId: session.sub } },
    include: { roomListing: true, property: true },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

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

      if (roomListing) {
        await tx.roomListing.updateMany({
          where: { id: roomListing.id, propertyId: current.propertyId, availableUnits: { gt: 0 } },
          data: { availableUnits: { decrement: 1 } },
        });

        await tx.application.update({
          where: { id: current.id },
          data: { roomListingId: roomListing.id },
        });
      }

      if (parsed.data.proposedBedId) {
        await tx.roomBed.update({
          where: { id: parsed.data.proposedBedId },
          data: { status: "OCCUPIED" },
        }).catch(() => null);
      }

      const existingTenancy = await tx.tenancy.findFirst({
        where: { studentId: current.studentId, propertyId: current.propertyId },
      });

      const rentAmount = parsed.data.offeredMonthlyRent
        ? parsed.data.offeredMonthlyRent
        : roomListing
        ? roomListing.monthlyRent
        : current.property.priceMonthly;

      const roomName = parsed.data.offeredRoomName || roomListing?.name || "Standard Room";
      const roomType = roomListing?.roomType || "Single";
      const startDate = parsed.data.leaseStartDate ? new Date(parsed.data.leaseStartDate) : new Date();
      const endDate = parsed.data.leaseEndDate ? new Date(parsed.data.leaseEndDate) : null;

      if (existingTenancy) {
        await tx.tenancy.update({
          where: { id: existingTenancy.id },
          data: {
            roomListingId: roomListing?.id,
            roomName,
            roomType,
            monthlyRent: rentAmount,
            status: "ACTIVE",
            startDate,
            endDate,
          },
        });
      } else {
        await tx.tenancy.create({
          data: {
            studentId: current.studentId,
            propertyId: current.propertyId,
            roomListingId: roomListing?.id,
            roomName,
            roomType,
            monthlyRent: rentAmount,
            status: "ACTIVE",
            startDate,
            endDate,
          },
        });
      }
    }

    const result = await tx.application.update({
      where: { id: current.id },
      data: {
        status: parsed.data.status,
        proposedBedId: parsed.data.proposedBedId !== undefined ? parsed.data.proposedBedId : undefined,
        offeredRoomName: parsed.data.offeredRoomName !== undefined ? parsed.data.offeredRoomName : undefined,
        offeredMonthlyRent: parsed.data.offeredMonthlyRent !== undefined ? parsed.data.offeredMonthlyRent : undefined,
        leaseStartDate: parsed.data.leaseStartDate ? new Date(parsed.data.leaseStartDate) : undefined,
        leaseEndDate: parsed.data.leaseEndDate ? new Date(parsed.data.leaseEndDate) : undefined,
        landlordNotes: parsed.data.landlordNotes !== undefined ? parsed.data.landlordNotes : undefined,
        rejectionReason: parsed.data.rejectionReason !== undefined ? parsed.data.rejectionReason : undefined,
      },
    });

    return result;
  });

  return NextResponse.json({ application: updated });
}
