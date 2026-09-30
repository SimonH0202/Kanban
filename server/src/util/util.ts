import { Prisma } from "@prisma/client";

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
