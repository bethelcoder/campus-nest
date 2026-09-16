import { randomInt } from "crypto";
import bcrypt from "bcryptjs";

// OTP is stored hashed (like a password) rather than in plaintext, so a
// database read/leak can't be used to verify students who never asked for
// a code, and so a compromised DB doesn't let an attacker impersonate the
// verification flow directly.

export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

export async function verifyOtp(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

export function otpExpiryDate(): Date {
  const minutes = Number(process.env.OTP_TTL_MINUTES ?? 10);
  return new Date(Date.now() + minutes * 60 * 1000);
}

export function isAllowedUniversityDomain(email: string): boolean {
  const allowed = (process.env.ALLOWED_UNIVERSITY_DOMAINS ?? "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length === 0) return true; // no allow-list configured
  const domain = email.split("@")[1]?.toLowerCase();
  return !!domain && allowed.includes(domain);
}
