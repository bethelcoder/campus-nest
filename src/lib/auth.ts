import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@prisma/client";

// jose (not jsonwebtoken) is used deliberately: src/middleware.ts runs on
// the Next.js Edge runtime, and jsonwebtoken depends on Node's `crypto`
// module which the Edge runtime does not provide. Using one JWT library
// everywhere avoids a subtle "works locally, breaks on Vercel" failure.

const encoder = new TextEncoder();

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return encoder.encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface SessionPayload {
  sub: string; // user id
  role: UserRole;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  onboardingStep: number;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "shp_session";
