"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const RenameBoardFolderSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  boardId: z.string(),
  workspaceId: z.string(),
});

type InputType = z.infer<typeof RenameBoardFolderSchema>;

const handler = async (data: InputType) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { id, name, boardId, workspaceId } = data;

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

    // Update the folder name
    const updatedFolder = await db.boardFolder.update({
      where: {
        id,
        boardId,
      },
      data: {
        name,
      },
    });

    revalidatePath(`/${workspaceId}/boards/${boardId}/documents`);
    return { data: updatedFolder };
  } catch (error) {
    console.error("[RENAME_BOARD_FOLDER_ERROR]", error);
    return { error: "Failed to rename folder" };
  }
};

export const renameBoardFolder = createSafeAction(
  RenameBoardFolderSchema,
  handler
);
