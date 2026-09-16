import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// NOTE ON ROUTE GROUPS:
// The project structure uses Next.js route groups — (student), (landlord),
// (admin) — and the parentheses mean the segment is NOT part of the URL.
// src/app/(student)/dashboard/page.tsx serves /dashboard, not
// /student/dashboard. That means URL-prefix middleware (the original plan)
// can never match these routes and would silently protect nothing.
//
// Role gating is therefore done per-group in each group's layout.tsx
// (see the (student)/layout.tsx, (landlord)/layout.tsx, (admin)/layout.tsx
// server components), which read the session cookie directly. This
// middleware is kept for the one thing middleware is actually good at:
// protecting the mutating API routes in one place, and refreshing/rejecting
// obviously invalid sessions early.

const PROTECTED_API_PREFIXES = ["/api/properties", "/api/tenancy", "/api/confirmation"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedApi = PROTECTED_API_PREFIXES.some((p) => pathname.startsWith(p));
  const isMutating = req.method !== "GET";
  if (!isProtectedApi || !isMutating) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
