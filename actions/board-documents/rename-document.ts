"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const RenameBoardDocumentSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  boardId: z.string(),
  workspaceId: z.string(),
});

type InputType = z.infer<typeof RenameBoardDocumentSchema>;

const handler = async (data: InputType) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { id, title, boardId, workspaceId } = data;

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

    // Check if the document exists
    const document = await db.boardDocument.findUnique({
      where: {
        id,
        boardId,
      },
    });

    if (!document) {
      return { error: "Document not found" };
    }

    // Update the document title
    const updatedDocument = await db.boardDocument.update({
      where: {
        id,
        boardId,
      },
      data: {
        title,
      },
    });

    revalidatePath(`/${workspaceId}/boards/${boardId}/documents`);
    return { data: updatedDocument };
  } catch (error) {
    console.error("[RENAME_BOARD_DOCUMENT_ERROR]", error);
    return { error: "Failed to rename document" };
  }
};

export const renameBoardDocument = createSafeAction(
  RenameBoardDocumentSchema,
  handler
);
