import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// Serverless platforms (Vercel) spin up a new function instance per request,
// so a normal TCP Prisma client would open a new Postgres connection every
// time and exhaust Neon's connection limit within minutes under any real
// traffic. The Neon adapter routes queries over HTTP/WebSockets instead,
// which is what makes Prisma safe to use on Vercel serverless functions.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
