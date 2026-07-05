import express from "express";
import cors from "cors";
import { prisma } from "./prisma.js";

const app = express();

app.use(cors());
app.use(express.json());

// Get all boards

app.get("/", async (req, res) => {
  const boards = await prisma.board.findMany();

  res.json(boards);
});

// Create a new board

app.post("/boards", async (req, res) => {
  const board = await prisma.board.create({
    data: {
      title: req.body.title,
    },
  });

  res.status(201).json(board);
});

// Get board by id

app.get("/boards/:id", async (req, res) => {
  const board = await prisma.board.findUnique({
    where: {
      id: req.params.id,
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
          },
        },
      },
    },
  });

  if (!board) {
    res.status(404).json({ message: "Board not found" });
    return;
  }

  res.json(board);
});

// Update board

app.patch("/boards/:id", async (req, res) => {
  try {
    const board = await prisma.column.update({
      where: {
        id: req.params.id,
      },
      data: {
        title: req.body.title,
      },
    });

    res.json(board);
  } catch (error) {
    res.status(404).json({ message: "Board not found" });
  }
});

// Delete board

app.delete("/boards/:id", async (req, res) => {
  try {
    await prisma.card.deleteMany({
      where: {
        column: {
          boardId: req.params.id,
        },
      },
    });

    await prisma.column.deleteMany({
      where: {
        boardId: req.params.id,
      },
    });

    await prisma.board.delete({
      where: {
        id: req.params.id,
      },
    });

    res.status(204).send();
  } catch {
    res.status(404).json({ message: "Board not found" });
  }
});

// Create a new column

app.post("/boards/:boardId/columns", async (req, res) => {
  const columnCount = await prisma.column.count({
    where: {
      boardId: req.params.boardId,
    },
  });

  const column = await prisma.column.create({
    data: {
      title: req.body.title,
      boardId: req.params.boardId,
      position: columnCount,
    },
    include: {
      cards: true,
    },
  });

  res.status(201).json(column);
});

// Update column

app.patch("/columns/:columnId", async (req, res) => {
  try {
    const column = await prisma.column.update({
      where: {
        id: req.params.columnId,
      },
      data: {
        title: req.body.title,
      },
    });

    res.json(column);
  } catch (error) {
    res.status(404).json({ message: "Column not found" });
  }
});

// Delete column

app.delete("/columns/:columnId", async (req, res) => {
  await prisma.card.deleteMany({
    where: {
      columnId: req.params.columnId,
    },
  });

  await prisma.column.delete({
    where: {
      id: req.params.columnId,
    },
  });

  res.status(204).send();
});

// Create a new card

app.post("/columns/:columnId/cards", async (req, res) => {
  const cardCount = await prisma.card.count({
    where: {
      columnId: req.params.columnId,
    },
  });

  const card = await prisma.card.create({
    data: {
      title: req.body.title,
      description: req.body.description ?? "",
      columnId: req.params.columnId,
      position: cardCount,
    },
  });

  res.status(201).json(card);
});

// Update card

app.patch("/cards/:cardId", async (req, res) => {
  try {
    const card = await prisma.card.update({
      where: {
        id: req.params.cardId,
      },
      data: {
        title: req.body.title,
        description: req.body.description,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
      },
    });

    res.json(card);
  } catch (error) {
    res.status(404).json({ message: "Card not found" });
  }
});

// Update card position

app.patch("/cards/:cardId/move", async (req, res) => {
  const card = await prisma.card.update({
    where: {
      id: req.params.cardId,
    },
    data: {
      columnId: req.body.columnId,
      position: req.body.position,
    },
  });

  res.json(card);
});

// Delete card

app.delete("/cards/:cardId", async (req, res) => {
  try {
    await prisma.card.delete({
      where: {
        id: req.params.cardId,
      },
    });

    res.status(204).send();
  } catch {
    res.status(404).json({ message: "Card not found" });
  }
});

// Log server running

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
