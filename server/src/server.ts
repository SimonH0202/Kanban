import express from "express";
import cors from "cors";
import { prisma } from "./prisma.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  const boards = await prisma.board.findMany();

  res.json(boards);
});

app.post("/boards", async (req, res) => {
  const board = await prisma.board.create({
    data: {
      title: req.body.title,
    },
  });

  res.status(201).json(board);
});

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

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
