import express from "express";
import cors from "cors";
import { prisma } from "./prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { requireAuth } from "./middleware/auth.js";

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
        userId: req.userId!,
      },
      select: {
        id: true,
        title: true,
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
        userId: req.userId!,
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
        userId: req.userId!,
      },
      include: {
        columns: {
          include: {
            cards: true,
          },
        },
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
        userId: req.userId!,
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
        userId: req.userId!,
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
          userId: req.userId!,
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
        board: {
          userId: req.userId!,
        },
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
          userId: req.userId!,
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
            userId: req.userId!,
          },
        },
      });

      if (!column) {
        res.status(404).json({
          message: "Column not found",
        });
        return;
      }

      const cardCount = await prisma.card.count({
        where: {
          columnId: column.id,
        },
      });

      const card = await prisma.card.create({
        data: {
          title: req.body.title,
          description: req.body.description ?? "",
          columnId: column.id,
          position: cardCount,
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
              userId: req.userId!,
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

      const card = await prisma.card.update({
        where: {
          id: existingCard.id,
        },
        data: {
          title: req.body.title,
          description: req.body.description,
          dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
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

      // Check ownership of the card
      const existingCard = await prisma.card.findFirst({
        where: {
          id: req.params.cardId,
          column: {
            board: {
              userId: req.userId!,
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

      // Check ownership of the destination column
      const destinationColumn = await prisma.column.findFirst({
        where: {
          id: columnId,
          board: {
            userId: req.userId!,
          },
        },
      });

      if (!destinationColumn) {
        res.status(404).json({
          message: "Destination column not found",
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
            board: {
              userId: req.userId!,
            },
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

// Log server running

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
