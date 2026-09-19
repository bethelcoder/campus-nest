import { verifySession, SESSION_COOKIE, type SessionPayload } from "@/lib/auth";

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return await verifySession(token);
  } catch (err) {
    return null;
  }
}


