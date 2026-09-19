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

const studentActionSchema = z.object({
  applicationId: z.string(),
  action: z.enum(["ACCEPT_OFFER", "DECLINE_OFFER", "CANCEL"]),
});

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = studentActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const application = await prisma.application.findFirst({
    where: { id: parsed.data.applicationId, studentId: session.sub },
    include: { property: true, roomListing: true },
  });

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (parsed.data.action === "ACCEPT_OFFER") {
    if (application.status !== "OFFER_MADE") {
      return NextResponse.json({ error: "No pending room offer for this application" }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id: application.id },
        data: { status: "ACCEPTED" },
      });

      // Claim bed if proposedBedId is set
      if (application.proposedBedId) {
        await tx.roomBed.update({
          where: { id: application.proposedBedId },
          data: { status: "OCCUPIED" },
        }).catch(() => null);
      }

      // Check / Create Tenancy record
      const existingTenancy = await tx.tenancy.findFirst({
        where: { studentId: session.sub, propertyId: application.propertyId },
      });

      const rentAmount = application.offeredMonthlyRent
        ? application.offeredMonthlyRent
        : application.roomListing
        ? application.roomListing.monthlyRent
        : application.property.priceMonthly;

      const roomName = application.offeredRoomName || application.roomListing?.name || "Standard Room";
      const roomType = application.roomListing?.roomType || "Single";

      if (existingTenancy) {
        await tx.tenancy.update({
          where: { id: existingTenancy.id },
          data: {
            status: "ACTIVE",
            monthlyRent: rentAmount,
            roomName,
            roomType,
            startDate: application.leaseStartDate || new Date(),
            endDate: application.leaseEndDate || null,
          },
        });
      } else {
        await tx.tenancy.create({
          data: {
            studentId: session.sub,
            propertyId: application.propertyId,
            roomListingId: application.roomListingId,
            status: "ACTIVE",
            monthlyRent: rentAmount,
            roomName,
            roomType,
            startDate: application.leaseStartDate || new Date(),
            endDate: application.leaseEndDate || null,
          },
        });
      }

      return app;
    });

    return NextResponse.json({ application: updated, success: true });
  }

  if (parsed.data.action === "DECLINE_OFFER" || parsed.data.action === "CANCEL") {
    const updated = await prisma.application.update({
      where: { id: application.id },
      data: { status: "CANCELLED" },
    });
    return NextResponse.json({ application: updated, success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
