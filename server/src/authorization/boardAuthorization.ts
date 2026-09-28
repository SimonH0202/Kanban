import { prisma } from "../prisma.js";

export async function isBoardOwner(
  userId: string,
  boardId: string,
): Promise<boolean> {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      ownerId: userId,
    },
    select: {
      id: true,
    },
  });
  return board !== null;
}

export async function canAccessBoard(
  userId: string,
  boardId: string,
): Promise<boolean> {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      OR: [
        {
          ownerId: userId,
        },
        {
          members: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    select: {
      id: true,
    },
  });
  return board !== null;
}
