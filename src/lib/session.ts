import "server-only";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE, type SessionPayload } from "@/lib/auth";

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}
