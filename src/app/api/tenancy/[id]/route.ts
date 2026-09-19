import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const updateTenancySchema = z.object({
  roomName: z.string().optional(),
  roomType: z.string().optional(),
  monthlyRent: z.number().optional(),
  deposit: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
  status: z.enum(["PENDING", "ACTIVE", "ENDED"]).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized. Landlord session required." }, { status: 401 });
    }

    const tenancyId = params.id;
    const tenancy = await prisma.tenancy.findUnique({
      where: { id: tenancyId },
      include: { property: true },
    });

    if (!tenancy) {
      return NextResponse.json({ error: "Tenancy record not found" }, { status: 404 });
    }

    if (tenancy.property.landlordId !== session.sub) {
      return NextResponse.json({ error: "Forbidden. Property does not belong to you." }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateTenancySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid tenancy update fields", details: parsed.error.flatten() }, { status: 400 });
    }

    const updateData: any = {};
    if (parsed.data.roomName !== undefined) updateData.roomName = parsed.data.roomName;
    if (parsed.data.roomType !== undefined) updateData.roomType = parsed.data.roomType;
    if (parsed.data.monthlyRent !== undefined) updateData.monthlyRent = parsed.data.monthlyRent;
    if (parsed.data.deposit !== undefined) updateData.deposit = parsed.data.deposit;
    if (parsed.data.startDate !== undefined) updateData.startDate = new Date(parsed.data.startDate);
    if (parsed.data.endDate !== undefined) updateData.endDate = parsed.data.endDate ? new Date(parsed.data.endDate) : null;
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;

    const updated = await prisma.tenancy.update({
      where: { id: tenancyId },
      data: updateData,
      include: {
        student: {
          include: { studentProfile: true },
        },
        property: true,
      },
    });

    return NextResponse.json({ success: true, tenancy: updated });
  } catch (err: any) {
    console.error("[Update Tenancy Error]", err);
    return NextResponse.json({ error: err?.message || "Failed to update tenancy" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "LANDLORD") {
      return NextResponse.json({ error: "Unauthorized. Landlord session required." }, { status: 401 });
    }

    const tenancyId = params.id;
    const tenancy = await prisma.tenancy.findUnique({
      where: { id: tenancyId },
      include: { property: true },
    });

    if (!tenancy) {
      return NextResponse.json({ error: "Tenancy record not found" }, { status: 404 });
    }

    if (tenancy.property.landlordId !== session.sub) {
      return NextResponse.json({ error: "Forbidden. Property does not belong to you." }, { status: 403 });
    }

    // Mark as ended or delete
    const url = new URL(req.url);
    const hardDelete = url.searchParams.get("hard") === "true";

    if (hardDelete) {
      await prisma.tenancy.delete({
        where: { id: tenancyId },
      });
    } else {
      await prisma.tenancy.update({
        where: { id: tenancyId },
        data: { status: "ENDED", endDate: new Date() },
      });
    }

    return NextResponse.json({ success: true, message: "Tenancy terminated successfully" });
  } catch (err: any) {
    console.error("[Delete Tenancy Error]", err);
    return NextResponse.json({ error: err?.message || "Failed to delete tenancy" }, { status: 500 });
  }
}
