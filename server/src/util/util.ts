import { Prisma } from "@prisma/client";
import { createHash, randomBytes } from "node:crypto";

export function isRecordNotFound(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

export function validatePassword(password: unknown): string | null {
  if (typeof password !== "string") return "Password is required";
  if ([...password].length < 15)
    return "Password must be at least 15 characters";
  if (Buffer.byteLength(password, "utf8") > 72) {
    return "Password is too long for the current password hashing setup";
  }
  return null;
}

export function validateEmail(email: unknown): string | null {
  if (typeof email !== "string") return "Email is required";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Invalid email address";
  }
  return null;
}

export function createVerificationToken() {
  const token = randomBytes(32).toString("hex");

  return {
    token,
    hash: hashVerificationToken(token),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
}

export function hashVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
