import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const notifications = await prisma.notification.findMany({
    where: { recipientId: session.sub },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const unreadCount = await prisma.notification.count({ where: { recipientId: session.sub, readAt: null } });
  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  if (body.id) {
    await prisma.notification.updateMany({
      where: { id: body.id, recipientId: session.sub },
      data: { readAt: new Date() },
    });
  } else {
    await prisma.notification.updateMany({
      where: { recipientId: session.sub, readAt: null },
      data: { readAt: new Date() },
    });
  }
  return NextResponse.json({ success: true });
}
