"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const DeleteBoardFolderSchema = z.object({
  id: z.string(),
  boardId: z.string(),
  workspaceId: z.string(),
});

type InputType = z.infer<typeof DeleteBoardFolderSchema>;

const handler = async (data: InputType) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { id, boardId, workspaceId } = data;

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

    // Check if the folder exists
    const folder = await db.boardFolder.findUnique({
      where: {
        id,
        boardId,
      },
    });

    if (!folder) {
      return { error: "Folder not found" };
    }

    // Delete the folder (cascade will delete all documents and subfolders)
    await db.boardFolder.delete({
      where: {
        id,
        boardId,
      },
    });

    revalidatePath(`/${workspaceId}/boards/${boardId}/documents`);
    return { success: true };
  } catch (error) {
    console.error("[DELETE_BOARD_FOLDER_ERROR]", error);
    return { error: "Failed to delete folder" };
  }
};

export const deleteBoardFolder = createSafeAction(
  DeleteBoardFolderSchema,
  handler
);
