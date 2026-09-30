import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";

type AuthPayload = {
  userId: string;
};

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.token;

  if (typeof token !== "string" || !token) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET is not configured");
    res.status(500).json({ message: "Authentication is not configured" });
    return;
  }

  let userId: string;

  try {
    const payload = jwt.verify(token, secret);

    if (
      typeof payload === "string" ||
      typeof payload.userId !== "string" ||
      !payload.userId
    ) {
      res.status(401).json({ message: "Invalid session" });
      return;
    }

    userId = payload.userId;
  } catch {
    res.status(401).json({
      message: "Invalid or expired session",
    });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        emailVerifiedAt: true,
      },
    });

    if (!user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    if (!user.emailVerifiedAt) {
      res.status(403).json({
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email before continuing",
      });
      return;
    }

    (req as any).userId = user.id;
  } catch (error) {
    console.error("Authentication database lookup failed:", error);
    res.status(500).json({
      message: "Could not check authentication",
    });
    return;
  }

  next();
}
