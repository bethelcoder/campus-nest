import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

export function getRoleDashboardPath(role?: string | null): string {
  switch (role) {
    case "STUDENT":
      return "/dashboard/student";
    case "LANDLORD":
      return "/dashboard/landlord";
    case "SRC_REPRESENTATIVE":
      return "/dashboard/src";
    case "ADMIN":
    case "UNIVERSITY_ADMIN":
      return "/dashboard/admin";
    default:
      return "/";
  }
}

export function getRoleLoginPath(role?: string | null, next?: string): string {
  let base = "/login";
  if (role === "LANDLORD") base = "/landlord/login";
  else if (role === "SRC_REPRESENTATIVE") base = "/src/login";
  else if (role === "ADMIN" || role === "UNIVERSITY_ADMIN") base = "/login";

  if (next) {
    return `${base}?next=${encodeURIComponent(next)}`;
  }
  return base;
}

export interface GuardOptions {
  allowedRoles: UserRole[];
  currentPath: string;
  requireVerified?: boolean;
  requireOnboarded?: boolean;
}

/**
 * Server-side RBAC guard for Next.js Server Components and Layouts.
 * Validates authentication, role, email verification, and onboarding status.
 * Intelligently redirects unauthorized users to their correct home.
 */
export async function requireRoleGuard(options: GuardOptions) {
  const { allowedRoles, currentPath, requireVerified = true, requireOnboarded = true } = options;

  const session = await getSession();
  if (!session) {
    // Map current path to the appropriate login page
    const loginRole = allowedRoles.length === 1 ? allowedRoles[0] : undefined;
    redirect(getRoleLoginPath(loginRole, currentPath));
  }

  // Cross-role interception: redirect to their authorized role dashboard
  const userRole = session.role as UserRole;
  if (!allowedRoles.includes(userRole)) {
    redirect(getRoleDashboardPath(userRole));
  }

  // Verify against active DB record for fresh state
  const dbUser = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      surname: true,
      emailVerifiedAt: true,
      onboardingCompleted: true,
    },
  });

  if (!dbUser) {
    redirect(getRoleLoginPath(userRole, currentPath));
  }

  // Email verification check
  if (requireVerified && !dbUser.emailVerifiedAt) {
    redirect(`/verify?email=${encodeURIComponent(dbUser.email)}&role=${encodeURIComponent(dbUser.role)}`);
  }

  // Onboarding completion check
  if (requireOnboarded && !dbUser.onboardingCompleted) {
    if (dbUser.role === "STUDENT") {
      redirect("/onboarding");
    } else if (dbUser.role === "LANDLORD") {
      redirect("/landlord/onboarding");
    }
  }

  return { session, user: dbUser };
}
