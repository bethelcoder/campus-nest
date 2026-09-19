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

  // 1. Strict Rule: Cannot apply if student has an active tenancy or pending lease
  const existingTenancy = await prisma.tenancy.findFirst({
    where: {
      studentId: session.sub,
      status: { in: ["PENDING", "ACTIVE"] },
    },
    include: { property: { select: { title: true, id: true } } },
  });

  if (existingTenancy) {
    const isPendingLease = existingTenancy.status === "PENDING";
    return NextResponse.json(
      {
        error: isPendingLease
          ? `You have a pending lease offer for "${existingTenancy.property.title}". Students cannot submit new applications while a lease is pending.`
          : `You currently hold an active tenancy at "${existingTenancy.property.title}". Students cannot apply for new accommodation while an active lease is in effect.`,
        code: "EXISTING_LEASE_CONFLICT",
        propertyTitle: existingTenancy.property.title,
        propertyId: existingTenancy.property.id,
      },
      { status: 409 }
    );
  }

  // 2. Strict Rule: Cannot hold active applications at multiple residences simultaneously
  const existingActiveApp = await prisma.application.findFirst({
    where: {
      studentId: session.sub,
      propertyId: { not: property.id },
      status: { in: ["PENDING", "UNDER_REVIEW", "OFFER_MADE", "ACCEPTED"] },
    },
    include: { property: { select: { title: true, id: true } } },
  });

  if (existingActiveApp) {
    return NextResponse.json(
      {
        error: `You already have an active application under review for "${existingActiveApp.property.title}". University accreditation policy permits only one active residence application at a time. Please wait for the landlord's decision or withdraw your current application before applying to another residence.`,
        code: "EXISTING_APPLICATION_CONFLICT",
        propertyTitle: existingActiveApp.property.title,
        existingPropertyId: existingActiveApp.property.id,
        existingApplicationId: existingActiveApp.id,
      },
      { status: 409 }
    );
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
