import { prisma } from "@/lib/prisma";

export async function notifyAdmins(input: {
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, string>;
}) {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  if (admins.length === 0) return;

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      recipientId: admin.id,
      type: input.type,
      title: input.title,
      message: input.message,
      metadata: input.metadata,
    })),
  });
}

export async function notifyUser(input: {
  recipientId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, string>;
}) {
  return prisma.notification.create({
    data: {
      recipientId: input.recipientId,
      type: input.type,
      title: input.title,
      message: input.message,
      metadata: input.metadata,
    },
  });
}