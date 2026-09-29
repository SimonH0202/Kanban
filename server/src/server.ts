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

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
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
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (existingUser) {
    res.status(400).json({ message: "User already exists" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email: email,
      passwordHash: hashedPassword,
    },
  });

  res.status(201).json({
    id: user.id,
    email: user.email,
  });
});

// Login a user

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email,
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

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false, // Set to true in production
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    id: user.id,
    email: user.email,
  });
});

// Logout a user

app.post("/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false, // Set to true in production
    sameSite: "lax",
  });

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

      if (typeof email !== "string" || email.trim() === "") {
        res.status(400).json({ message: "A valid email is required" });
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
          email,
        },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
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
      console.error(error);
      res.status(500).json({
        message: "Failed to delete tag",
      });
    }
  },
);

// Log server running

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
