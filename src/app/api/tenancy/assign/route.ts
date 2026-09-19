import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const assignTenancySchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  studentId: z.string().optional(),
  // For assigning a new or existing student by direct input
  name: z.string().optional(),
  surname: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  studentNumber: z.string().optional(),
  universityName: z.string().optional(),
  fundingType: z.string().optional(),
  funderReference: z.string().optional(),
  
  // Room allocation fields
  roomName: z.string().min(1, "Room name is required"),
  roomType: z.string().default("SINGLE_STANDARD"),
  monthlyRent: z.number().min(0, "Monthly rent is required"),
  deposit: z.number().optional().default(0),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  status: z.enum(["PENDING", "ACTIVE", "ENDED"]).default("ACTIVE"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized. Landlord session required." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = assignTenancySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid tenancy details", details: parsed.error.flatten() }, { status: 400 });
    }

    const {
      propertyId,
      studentId: providedStudentId,
      name,
      surname,
      email,
      phone,
      studentNumber,
      universityName,
      fundingType,
      funderReference,
      roomName,
      roomType,
      monthlyRent,
      deposit,
      startDate,
      endDate,
      status,
    } = parsed.data;

    // Verify property ownership
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property || property.landlordId !== session.sub) {
      return NextResponse.json({ error: "Property not found or does not belong to you." }, { status: 404 });
    }

    let resolvedStudentId = providedStudentId;

    // If studentId not provided directly, find or create student user
    if (!resolvedStudentId && email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        include: { studentProfile: true },
      });

      if (existingUser) {
        resolvedStudentId = existingUser.id;
        // Update student profile details if missing
        if (!existingUser.studentProfile) {
          await prisma.studentProfile.create({
            data: {
              userId: existingUser.id,
              studentNumber: studentNumber || null,
              universityName: universityName || null,
              fundingType: fundingType || "NSFAS",
              funderReference: funderReference || null,
            },
          });
        }
      } else {
        // Create new student account
        const newUser = await prisma.user.create({
          data: {
            role: "STUDENT",
            name: name || "Student",
            surname: surname || "Resident",
            email: email,
            phone: phone || null,
            institutionName: universityName || null,
            onboardingCompleted: true,
            studentProfile: {
              create: {
                studentNumber: studentNumber || null,
                universityName: universityName || null,
                fundingType: fundingType || "NSFAS",
                funderReference: funderReference || null,
              },
            },
          },
        });
        resolvedStudentId = newUser.id;
      }
    }

    if (!resolvedStudentId) {
      return NextResponse.json({ error: "A valid student ID or student email is required to assign tenancy." }, { status: 400 });
    }

    // Create the tenancy
    const tenancy = await prisma.tenancy.create({
      data: {
        studentId: resolvedStudentId,
        propertyId,
        roomName,
        roomType,
        monthlyRent,
        deposit,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status,
      },
      include: {
        student: {
          include: { studentProfile: true },
        },
        property: true,
      },
    });

    return NextResponse.json({ success: true, tenancy }, { status: 201 });
  } catch (err: any) {
    console.error("[Assign Tenancy Error]", err);
    return NextResponse.json({ error: err?.message || "Failed to assign tenancy" }, { status: 500 });
  }
}
