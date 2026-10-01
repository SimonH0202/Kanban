import express from "express";
import cors from "cors";
import { prisma } from "./prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { requireAuth } from "./middleware/auth.js";
import {
  canAccessBoard,
  isBoardOwner,
} from "./authorization/boardAuthorization.js";
import { Prisma } from "@prisma/client";
import CardOrderError from "./helpers/cardOrderError.js";
import { sendVerificationEmail } from "./authorization/emailVerification.js";
import { createVerificationToken, hashVerificationToken } from "./util/util.js";
import {
  isRecordNotFound,
  validateEmail,
  validatePassword,
} from "./util/util.js";
import { sendPasswordResetEmail } from "./authorization/passwordReset.js";

const app = express();

const frontendUrl = process.env.FRONTEND_URL;

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

if (!frontendUrl) {
  throw new Error("FRONTEND_URL is required");
}

app.use(
  cors({
    origin: new URL(frontendUrl).origin,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// Get current user

app.get("/auth/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.userId!,
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.json(user);
});

// Register a new user

app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string"
  ) {
    res.status(400).json({
      message: "Email and password are required",
    });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const emailError = validateEmail(normalizedEmail);

  if (emailError) {
    res.status(400).json({ message: emailError });
    return;
  }

  const passwordError = validatePassword(password);

  if (passwordError) {
    res.status(400).json({ message: passwordError });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      res.status(409).json({
        message: "An account with this email already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verification = createVerificationToken();

    await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: hashedPassword,
        emailVerificationTokenHash: verification.hash,
        emailVerificationExpiresAt: verification.expiresAt,
      },
    });

    try {
      await sendVerificationEmail(normalizedEmail, verification.token);
    } catch (error) {
      console.error("Verification email delivery failed:", error);

      // Keep the unverified account so delivery can be retried.
      res.status(201).json({
        requiresEmailVerification: true,
        verificationEmailSent: false,
        message:
          "Account created, but the verification email could not be sent. Please request a new verification email.",
      });
      return;
    }

    res.status(201).json({
      requiresEmailVerification: true,
      verificationEmailSent: true,
      message: "Check your email to verify your account",
    });
  } catch (error) {
    // Handles two registrations for the same email arriving together.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      res.status(409).json({
        message: "An account with this email already exists",
      });
      return;
    }

    console.error("Registration failed:", error);
    res.status(500).json({ message: "Could not create account" });
  }
});

// Verify email address

app.post("/auth/verify-email", async (req, res) => {
  const { token } = req.body ?? {};

  // Our helper generates 32 random bytes encoded as 64 hex characters.
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
    res.status(400).json({
      message: "Invalid verification link",
    });
    return;
  }

  try {
    const result = await prisma.user.updateMany({
      where: {
        emailVerifiedAt: null,
        emailVerificationTokenHash: hashVerificationToken(token),
        emailVerificationExpiresAt: { gt: new Date() },
      },
      data: {
        emailVerifiedAt: new Date(),
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null,
      },
    });

    if (result.count === 0) {
      res.status(400).json({
        message:
          "This verification link is invalid, expired, or already used. Please request a new email if needed.",
      });
      return;
    }

    res.json({
      message: "Email verified. You can now log in.",
    });
  } catch (error) {
    console.error("Email verification failed:", error);
    res.status(500).json({
      message: "Could not verify email. Please try again.",
    });
  }
});

// Resend verification email

app.post("/auth/resend-verification", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    !password
  ) {
    res.status(400).json({
      message: "Email and password are required",
    });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    if (user.emailVerifiedAt) {
      res.json({
        message: "Your email is already verified. You can log in.",
      });
      return;
    }

    // The helper sets expiry to 24 hours after token creation.
    // Use that to enforce a 60-second resend cooldown.
    if (user.emailVerificationExpiresAt) {
      const issuedAt =
        user.emailVerificationExpiresAt.getTime() - 24 * 60 * 60 * 1000;

      const remainingMs = issuedAt + 60_000 - Date.now();

      if (remainingMs > 0) {
        res.setHeader("Retry-After", Math.ceil(remainingMs / 1000));
        res.status(429).json({
          message: "Please wait a minute before requesting another email",
        });
        return;
      }
    }

    const verification = createVerificationToken();

    const result = await prisma.user.updateMany({
      where: {
        id: user.id,
        emailVerifiedAt: null,
        emailVerificationTokenHash: user.emailVerificationTokenHash,
        emailVerificationExpiresAt: user.emailVerificationExpiresAt,
      },
      data: {
        emailVerificationTokenHash: verification.hash,
        emailVerificationExpiresAt: verification.expiresAt,
      },
    });

    if (result.count === 0) {
      res.status(409).json({
        message: "Account verification changed. Please try again.",
      });
      return;
    }

    try {
      await sendVerificationEmail(user.email, verification.token);
    } catch (error) {
      console.error("Verification email delivery failed:", error);
      res.status(502).json({
        message:
          "Could not send the verification email. Please wait a minute and try again.",
      });
      return;
    }

    res.json({
      message: "Verification email sent. Check your inbox.",
    });
  } catch (error) {
    console.error("Resending verification failed:", error);
    res.status(500).json({
      message: "Could not resend verification email",
    });
  }
});

// Send password reset email

app.post("/auth/request-password-reset", async (req, res) => {
  const { email } = req.body ?? {};

  if (typeof email !== "string") {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const emailError = validateEmail(normalizedEmail);

  if (emailError) {
    res.status(400).json({ message: emailError });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
    select: {
      id: true,
      emailVerifiedAt: true,
      passwordResetTokenHash: true,
      passwordResetExpiresAt: true,
    },
  });

  if (!user) {
    res.status(400).json({ message: "Invalid email" });
    return;
  }

  if (!user.emailVerifiedAt) {
    res.status(403).json({
      code: "EMAIL_NOT_VERIFIED",
      message: "Please verify your email before resetting your password",
    });
    return;
  }

  if (user.passwordResetExpiresAt) {
    const remainingMs = user.passwordResetExpiresAt.getTime() - Date.now();
    if (remainingMs > 0) {
      res.setHeader("Retry-After", Math.ceil(remainingMs / 1000));
      res.status(429).json({
        code: "PASSWORD_RESET_RATE_LIMITED",
        message: "Please wait before requesting another password reset",
      });
      return;
    }
  }

  if (user.passwordResetTokenHash) {
    res.status(409).json({
      code: "PASSWORD_RESET_TOKEN_EXISTS",
      message: "A password reset is already in progress",
    });
    return;
  }

  const verification = createVerificationToken();

  await prisma.user.updateMany({
    where: {
      id: user.id,
    },
    data: {
      passwordResetTokenHash: verification.hash,
      passwordResetExpiresAt: verification.expiresAt,
    },
  });

  try {
    await sendPasswordResetEmail(email, verification.token);
  } catch (error) {
    console.error("Password reset email delivery failed:", error);
    res.status(502).json({
      message:
        "Could not send the password reset email. Please wait a minute and try again.",
    });
    return;
  }

  res.json({
    message: "Password reset email sent. Check your inbox.",
  });
});

// Login a user

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  if (!email?.trim() || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const emailError = validateEmail(normalizedEmail);

  if (emailError) {
    res.status(400).json({ message: emailError });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user) {
    res.status(400).json({ message: "Invalid email or password" });
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    res.status(400).json({ message: "Invalid email or password" });
    return;
  }

  if (!user.emailVerifiedAt) {
    res.status(403).json({
      code: "EMAIL_NOT_VERIFIED",
      message: "Please verify your email before logging in",
    });
    return;
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    ...authCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    id: user.id,
    email: user.email,
  });
});

// Logout a user

app.post("/auth/logout", (req, res) => {
  res.clearCookie("token", authCookieOptions);

  res.status(204).send();
});

// Get all boards

app.get("/boards", requireAuth, async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      where: {
        OR: [
          {
            ownerId: req.userId!,
          },
          {
            members: {
              some: {
                userId: req.userId!,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        ownerId: true,
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch boards" });
  }
});

// Create a new board

app.post("/boards", requireAuth, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      res.status(400).json({ message: "Title is required" });
      return;
    }

    const board = await prisma.board.create({
      data: {
        title,
        ownerId: req.userId!,
      },
    });

    res.status(201).json(board);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create board" });
  }
});

// Get board by id

app.get<{ id: string }>("/boards/:id", requireAuth, async (req, res) => {
  try {
    const board = await prisma.board.findFirst({
      where: {
        id: req.params.id,
        OR: [
          {
            ownerId: req.userId!,
          },
          {
            members: {
              some: {
                userId: req.userId!,
              },
            },
          },
        ],
      },
      include: {
        columns: {
          orderBy: {
            position: "asc",
          },
          include: {
            cards: {
              orderBy: {
                position: "asc",
              },
              include: {
                tags: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
        tags: true,
      },
    });

    if (!board) {
      res.status(404).json({
        message: "Board not found",
      });
      return;
    }

    res.json(board);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to load board",
    });
  }
});

// Update board

app.patch<{ id: string }>("/boards/:id", requireAuth, async (req, res) => {
  try {
    const { title } = req.body;

    const existingBoard = await prisma.board.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.userId!,
      },
    });

    if (!existingBoard) {
      res.status(404).json({ message: "Board not found" });
      return;
    }

    const board = await prisma.board.update({
      where: {
        id: existingBoard.id,
      },
      data: {
        title,
      },
    });

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: "Failed to update board" });
  }
});

// Delete board

app.delete<{ id: string }>("/boards/:id", requireAuth, async (req, res) => {
  try {
    const board = await prisma.board.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.userId!,
      },
    });

    if (!board) {
      res.status(404).json({ message: "Board not found" });
      return;
    }

    await prisma.card.deleteMany({
      where: {
        column: {
          boardId: board.id,
        },
      },
    });

    await prisma.column.deleteMany({
      where: {
        boardId: board.id,
      },
    });

    await prisma.tag.deleteMany({
      where: {
        boardId: board.id,
      },
    });

    await prisma.board.delete({
      where: {
        id: board.id,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete board" });
  }
});

// Add a member to a board
app.post<{ boardId: string }>(
  "/boards/:boardId/members",
  requireAuth,
  async (req, res) => {
    try {
      const { email } = req.body;

      if (typeof email !== "string" || !email.trim()) {
        res.status(400).json({ message: "Email is required" });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();

      const emailError = validateEmail(normalizedEmail);

      if (emailError) {
        res.status(400).json({ message: emailError });
        return;
      }

      const board = await prisma.board.findFirst({
        where: {
          id: req.params.boardId,
          ownerId: req.userId!,
        },
      });

      if (!board) {
        res.status(404).json({ message: "Board not found" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

      if (!user) {
        res.status(404).json({ message: "No user found with this email" });
        return;
      }

      if (!user || !user.emailVerifiedAt) {
        res.status(400).json({
          message: "No verified account found for this email address",
        });
        return;
      }

      if (user.id === board.ownerId) {
        res
          .status(400)
          .json({ message: "Cannot add the board owner as a member" });
        return;
      }

      const existingMember = await prisma.boardMember.findUnique({
        where: {
          boardId_userId: {
            boardId: board.id,
            userId: user.id,
          },
        },
      });

      if (existingMember) {
        res
          .status(400)
          .json({ message: "User is already a member of this board" });
        return;
      }

      const member = await prisma.boardMember.create({
        data: {
          boardId: board.id,
          userId: user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      res.status(201).json(member);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to add board member" });
    }
  },
);

// Get all members of a board
app.get<{ boardId: string }>(
  "/boards/:boardId/members",
  requireAuth,
  async (req, res) => {
    try {
      const hasAccess = await canAccessBoard(req.userId!, req.params.boardId);

      if (!hasAccess) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      const members = await prisma.boardMember.findMany({
        where: {
          boardId: req.params.boardId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: {
          joinedAt: "asc",
        },
      });

      res.json(members);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to get board members" });
    }
  },
);

// Remove a member from a board
app.delete<{ boardId: string; userId: string }>(
  "/boards/:boardId/members/:userId",
  requireAuth,
  async (req, res) => {
    try {
      const { boardId, userId } = req.params;

      const isOwner = await isBoardOwner(req.userId!, boardId);

      if (!isOwner) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      const member = await prisma.boardMember.findUnique({
        where: {
          boardId_userId: {
            boardId,
            userId,
          },
        },
      });

      if (!member) {
        res.status(404).json({ message: "Member not found" });
        return;
      }

      await prisma.boardMember.delete({
        where: {
          boardId_userId: {
            boardId,
            userId,
          },
        },
      });

      res.json(member);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to remove board member" });
    }
  },
);

// Create a new column

app.post<{ boardId: string }>(
  "/boards/:boardId/columns",
  requireAuth,
  async (req, res) => {
    try {
      const { title } = req.body;

      // Make sure the board belongs to the logged-in user
      const board = await prisma.board.findFirst({
        where: {
          id: req.params.boardId,
          OR: [
            {
              ownerId: req.userId!,
            },
            {
              members: {
                some: {
                  userId: req.userId!,
                },
              },
            },
          ],
        },
      });

      if (!board) {
        res.status(404).json({
          message: "Board not found",
        });
        return;
      }

      // Find the last column position on this board
      const lastColumn = await prisma.column.findFirst({
        where: {
          boardId: board.id,
        },
        orderBy: {
          position: "desc",
        },
      });

      const position = lastColumn ? lastColumn.position + 1 : 0;

      const column = await prisma.column.create({
        data: {
          title,
          boardId: board.id,
          position,
        },
        include: {
          cards: true,
        },
      });

      res.status(201).json(column);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Failed to create column",
      });
    }
  },
);

// Update column

app.patch<{ id: string }>("/columns/:id", requireAuth, async (req, res) => {
  try {
    const { title } = req.body;

    const column = await prisma.column.findFirst({
      where: {
        id: req.params.id,
        OR: [
          {
            board: {
              ownerId: req.userId!,
            },
          },
          {
            board: {
              members: {
                some: {
                  userId: req.userId!,
                },
              },
            },
          },
        ],
      },
    });

    if (!column) {
      res.status(404).json({
        message: "Column not found",
      });
      return;
    }

    const updatedColumn = await prisma.column.update({
      where: {
        id: column.id,
      },
      data: {
        title,
      },
    });

    res.json(updatedColumn);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update column",
    });
  }
});

// Delete column

app.delete<{ id: string }>("/columns/:id", requireAuth, async (req, res) => {
  try {
    const column = await prisma.column.findFirst({
      where: {
        id: req.params.id,
        board: {
          OR: [
            {
              ownerId: req.userId!,
            },
            {
              members: {
                some: {
                  userId: req.userId!,
                },
              },
            },
          ],
        },
      },
    });

    if (!column) {
      res.status(404).json({
        message: "Column not found",
      });
      return;
    }

    await prisma.card.deleteMany({
      where: {
        columnId: column.id,
      },
    });

    await prisma.column.delete({
      where: {
        id: column.id,
      },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete column",
    });
  }
});

// Create a new card

app.post<{ columnId: string }>(
  "/columns/:columnId/cards",
  requireAuth,
  async (req, res) => {
    try {
      const column = await prisma.column.findFirst({
        where: {
          id: req.params.columnId,
          board: {
            OR: [
              {
                ownerId: req.userId!,
              },
              {
                members: {
                  some: {
                    userId: req.userId!,
                  },
                },
              },
            ],
          },
        },
      });

      if (!column) {
        res.status(404).json({
          message: "Column not found",
        });
        return;
      }

      const lastCard = await prisma.card.findFirst({
        where: {
          columnId: column.id,
        },
        orderBy: {
          position: "desc",
        },
      });

      const position = lastCard ? lastCard.position + 1 : 0;

      const card = await prisma.card.create({
        data: {
          title: req.body.title,
          description: req.body.description ?? "",
          columnId: column.id,
          position: position,
        },
        include: {
          tags: true,
        },
      });

      res.status(201).json(card);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to create card",
      });
    }
  },
);

// Update card

app.patch<{ cardId: string }>(
  "/cards/:cardId",
  requireAuth,
  async (req, res) => {
    try {
      const existingCard = await prisma.card.findFirst({
        where: {
          id: req.params.cardId,
          column: {
            board: {
              OR: [
                {
                  ownerId: req.userId!,
                },
                {
                  members: {
                    some: {
                      userId: req.userId!,
                    },
                  },
                },
              ],
            },
          },
        },
        include: {
          column: {
            select: {
              boardId: true,
            },
          },
        },
      });

      if (!existingCard) {
        res.status(404).json({
          message: "Card not found",
        });
        return;
      }

      const { dueDate } = req.body;

      let parsedDueDate: Date | null | undefined;

      if (dueDate === null) {
        parsedDueDate = null;
      } else if (dueDate !== undefined) {
        if (typeof dueDate !== "string") {
          res.status(400).json({
            message: "Invalid due date format",
          });
          return;
        }

        parsedDueDate = new Date(dueDate);

        if (Number.isNaN(parsedDueDate.getTime())) {
          res.status(400).json({
            message: "Invalid due date format",
          });
          return;
        }
      }

      // Check if the provided tags exist and belong to the same board as the card
      if (req.body.tags !== undefined) {
        if (!Array.isArray(req.body.tags)) {
          res.status(400).json({
            message: "Tags must be an array",
          });
          return;
        }

        const tagIds = [
          ...new Set<string>(
            (req.body.tags as { id: string }[]).map((tag) => tag.id),
          ),
        ];

        const existingTags = await prisma.tag.findMany({
          where: {
            id: {
              in: tagIds,
            },
            boardId: existingCard.column.boardId,
          },
        });

        if (existingTags.length !== tagIds.length) {
          res.status(400).json({
            message:
              "One or more tags do not exist or do not belong to the same board as the card",
          });
          return;
        }
      }

      const card = await prisma.card.update({
        where: {
          id: existingCard.id,
        },
        data: {
          title: req.body.title,
          description: req.body.description,
          ...(req.body.tags !== undefined
            ? {
                tags: {
                  set: req.body.tags.map((tag: { id: string }) => ({
                    id: tag.id,
                  })),
                },
              }
            : {}),
          ...(parsedDueDate !== undefined ? { dueDate: parsedDueDate } : {}),
        },
        include: {
          tags: true,
        },
      });

      res.json(card);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to update card",
      });
    }
  },
);

// Update card position

app.patch<{ cardId: string }>(
  "/cards/:cardId/move",
  requireAuth,
  async (req, res) => {
    try {
      const { columnId, position } = req.body;

      if (typeof columnId !== "string" || columnId.trim() === "") {
        res.status(400).json({
          message: "A destination column ID is required",
        });
        return;
      }

      if (
        !Number.isInteger(position) ||
        position < 0 ||
        position > 2147483647
      ) {
        res.status(400).json({
          message:
            "Position must be a non-negative integer within the range of a 32-bit signed integer",
        });
        return;
      }

      // Check ownership of the card
      const existingCard = await prisma.card.findFirst({
        where: {
          id: req.params.cardId,
          OR: [
            {
              column: {
                board: {
                  ownerId: req.userId!,
                },
              },
            },
            {
              column: {
                board: {
                  members: {
                    some: {
                      userId: req.userId!,
                    },
                  },
                },
              },
            },
          ],
        },
        include: {
          column: {
            select: {
              boardId: true,
            },
          },
        },
      });

      if (!existingCard) {
        res.status(404).json({
          message: "Card not found",
        });
        return;
      }

      const destinationColumn = await prisma.column.findFirst({
        where: {
          id: columnId,
          OR: [
            {
              board: {
                ownerId: req.userId!,
              },
            },
            {
              board: {
                members: {
                  some: {
                    userId: req.userId!,
                  },
                },
              },
            },
          ],
        },
      });

      // Check ownership of the destination column
      if (!destinationColumn) {
        res.status(404).json({
          message: "Destination column not found",
        });
        return;
      }

      // Check if the destination column exists and belongs to the same board as the card
      if (existingCard.column.boardId !== destinationColumn.boardId) {
        res.status(400).json({
          message:
            "Destination column must belong to the same board as the card",
        });
        return;
      }

      const card = await prisma.card.update({
        where: {
          id: existingCard.id,
        },
        data: {
          columnId: destinationColumn.id,
          position,
        },
        include: {
          tags: true,
        },
      });

      res.json(card);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to move card",
      });
    }
  },
);

type CardOrderColumn = {
  columnId: string;
  cardIds: string[];
};

app.patch<{ boardId: string }>(
  "/boards/:boardId/card-order",
  requireAuth,
  async (req, res) => {
    const { boardId } = req.params;
    const requestedColumns = req.body?.columns;

    if (
      !Array.isArray(requestedColumns) ||
      !requestedColumns.every(
        (column: unknown): column is CardOrderColumn =>
          typeof column === "object" &&
          column !== null &&
          typeof (column as CardOrderColumn).columnId === "string" &&
          Array.isArray((column as CardOrderColumn).cardIds) &&
          (column as CardOrderColumn).cardIds.every(
            (id: unknown) => typeof id === "string",
          ),
      )
    ) {
      res.status(400).json({ message: "Invalid card order" });
      return;
    }

    try {
      await prisma.$transaction(
        async (tx) => {
          // Check access inside the same transaction as the updates.
          const board = await tx.board.findFirst({
            where: {
              id: boardId,
              OR: [
                { ownerId: req.userId! },
                { members: { some: { userId: req.userId! } } },
              ],
            },
            select: { id: true },
          });

          if (!board) {
            throw new CardOrderError(404, "Board not found");
          }

          const databaseColumns = await tx.column.findMany({
            where: { boardId },
            select: {
              id: true,
              cards: { select: { id: true } },
            },
          });

          const actualColumnIds = new Set(
            databaseColumns.map((column) => column.id),
          );
          const submittedColumnIds = requestedColumns.map(
            (column: CardOrderColumn) => column.columnId,
          );

          if (
            submittedColumnIds.length !== actualColumnIds.size ||
            new Set(submittedColumnIds).size !== actualColumnIds.size ||
            submittedColumnIds.some((id: string) => !actualColumnIds.has(id))
          ) {
            throw new CardOrderError(
              400,
              "Order must include every column on the board exactly once",
            );
          }

          const actualCardIds = new Set(
            databaseColumns.flatMap((column) =>
              column.cards.map((card) => card.id),
            ),
          );
          const submittedCardIds = requestedColumns.flatMap(
            (column: CardOrderColumn) => column.cardIds,
          );

          if (
            submittedCardIds.length !== actualCardIds.size ||
            new Set(submittedCardIds).size !== actualCardIds.size ||
            submittedCardIds.some((id: string) => !actualCardIds.has(id))
          ) {
            throw new CardOrderError(
              400,
              "Order must include every card on the board exactly once",
            );
          }

          for (const column of requestedColumns as CardOrderColumn[]) {
            for (
              let position = 0;
              position < column.cardIds.length;
              position++
            ) {
              await tx.card.update({
                where: { id: column.cardIds[position] },
                data: {
                  columnId: column.columnId,
                  position,
                },
              });
            }
          }
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        },
      );

      res.status(204).send();
    } catch (error) {
      if (error instanceof CardOrderError) {
        res.status(error.status).json({ message: error.message });
        return;
      }

      console.error(error);
      res.status(500).json({ message: "Failed to save card order" });
    }
  },
);

// Delete card

app.delete<{ cardId: string }>(
  "/cards/:cardId",
  requireAuth,
  async (req, res) => {
    try {
      const card = await prisma.card.findFirst({
        where: {
          id: req.params.cardId,
          column: {
            OR: [
              {
                board: {
                  ownerId: req.userId!,
                },
              },
              {
                board: {
                  members: {
                    some: {
                      userId: req.userId!,
                    },
                  },
                },
              },
            ],
          },
        },
      });

      if (!card) {
        res.status(404).json({
          message: "Card not found",
        });
        return;
      }

      await prisma.card.delete({
        where: {
          id: card.id,
        },
      });

      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to delete card",
      });
    }
  },
);

// Create a new tag
app.post<{ boardId: string }>(
  "/boards/:boardId/tags",
  requireAuth,
  async (req, res) => {
    try {
      const { name, color } = req.body;

      // Make sure the user has access to the board
      const board = await prisma.board.findFirst({
        where: {
          id: req.params.boardId,
          OR: [
            {
              ownerId: req.userId!,
            },
            {
              members: {
                some: {
                  userId: req.userId!,
                },
              },
            },
          ],
        },
      });

      if (!board) {
        res.status(404).json({
          message: "Board not found",
        });
        return;
      }

      if (typeof name !== "string" || name.trim() === "") {
        res.status(400).json({
          message: "A tag name is required",
        });
        return;
      }

      if (typeof color !== "string" || color.trim() === "") {
        res.status(400).json({
          message: "A tag color is required",
        });
        return;
      }

      const tag = await prisma.tag.create({
        data: {
          name,
          color,
          boardId: req.params.boardId,
        },
      });

      res.json(tag);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to create tag",
      });
    }
  },
);

// Get all tags for a board
app.get<{ boardId: string }>(
  "/boards/:boardId/tags",
  requireAuth,
  async (req, res) => {
    try {
      // Make sure the user has access to the board
      const board = await prisma.board.findFirst({
        where: {
          id: req.params.boardId,
          OR: [
            {
              ownerId: req.userId!,
            },
            {
              members: {
                some: {
                  userId: req.userId!,
                },
              },
            },
          ],
        },
      });

      if (!board) {
        res.status(404).json({
          message: "Board not found",
        });
        return;
      }

      const tags = await prisma.tag.findMany({
        where: {
          boardId: req.params.boardId,
        },
      });

      res.json(tags);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to get tags",
      });
    }
  },
);

// Delete a tag from a board
app.delete<{ boardId: string; tagId: string }>(
  "/boards/:boardId/tags/:tagId",
  requireAuth,
  async (req, res) => {
    try {
      // Make sure the user has access to the board
      const hasAccess = await canAccessBoard(req.userId!, req.params.boardId);
      if (!hasAccess) {
        res.status(403).json({
          message: "You do not have permission to delete this tag",
        });
        return;
      }

      await prisma.tag.delete({
        where: {
          id: req.params.tagId,
          boardId: req.params.boardId,
        },
      });

      res.status(204).send();
    } catch (error) {
      if (isRecordNotFound(error)) {
        res.status(404).json({
          message: "Tag not found",
        });
        return;
      }

      console.error(error);
      res.status(500).json({
        message: "Failed to delete tag",
      });
    }
  },
);

// Update a tag on a board
app.patch<{ boardId: string; tagId: string }>(
  "/boards/:boardId/tags/:tagId",
  requireAuth,
  async (req, res) => {
    try {
      const { name, color } = req.body;

      if (!name || typeof name !== "string" || name.trim() === "") {
        res.status(400).json({
          message: "A tag name is required",
        });
        return;
      }

      if (!color || typeof color !== "string" || color.trim() === "") {
        res.status(400).json({
          message: "A tag color is required",
        });
        return;
      }

      // Make sure the user has access to the board
      const hasAccess = await canAccessBoard(req.userId!, req.params.boardId);
      if (!hasAccess) {
        res.status(403).json({
          message: "You do not have permission to update this tag",
        });
        return;
      }

      const tag = await prisma.tag.update({
        where: {
          id: req.params.tagId,
          boardId: req.params.boardId,
        },
        data: {
          name,
          color,
        },
      });

      res.json(tag);
    } catch (error) {
      if (isRecordNotFound(error)) {
        res.status(404).json({
          message: "Tag not found",
        });
        return;
      }
      console.error(error);
      res.status(500).json({
        message: "Failed to update tag",
      });
    }
  },
);

// Log server running

const port = Number(process.env.PORT || 3000);

app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}`);
});
