"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const CreateBoardFolderSchema = z.object({
  name: z.string().min(1, "Name is required"),
  boardId: z.string(),
  workspaceId: z.string(),
  parentId: z.string().optional(),
});

type InputType = z.infer<typeof CreateBoardFolderSchema>;

const handler = async (data: InputType) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { name, boardId, workspaceId, parentId } = data;

  try {
    // Check if the board exists and the user has access to it
    const board = await db.board.findFirst({
      where: {
        id: boardId,
        workspaceId,
        User: {
          some: {
            id: user.id,
          },
        },
      },
    });

    if (!board) {
      return { error: "Board not found or access denied" };
    }

    // If a parent ID is provided, check if it exists
    if (parentId) {
      const parentFolder = await db.boardFolder.findUnique({
        where: {
          id: parentId,
          boardId,
        },
      });

      if (!parentFolder) {
        return { error: "Parent folder not found" };
      }
    }

    // Get the highest order value to place the new folder at the end
    const highestOrder = await db.boardFolder.findFirst({
      where: {
        boardId,
        parentId: parentId || null,
      },
      orderBy: {
        order: "desc",
      },
      select: {
        order: true,
      },
    });

    const newOrder = highestOrder ? highestOrder.order + 1 : 0;

    // Create the folder
    const folder = await db.boardFolder.create({
      data: {
        name,
        boardId,
        parentId: parentId || null,
        createdById: user.id,
        order: newOrder,
      },
    });

    revalidatePath(`/${workspaceId}/boards/${boardId}/documents`);
    return { data: folder };
  } catch (error) {
    console.error("[CREATE_BOARD_FOLDER_ERROR]", error);
    return { error: "Failed to create folder" };
  }
};

export const createBoardFolder = createSafeAction(
  CreateBoardFolderSchema,
  handler
);
