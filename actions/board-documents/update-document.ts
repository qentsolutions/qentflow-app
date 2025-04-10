"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const UpdateBoardDocumentSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  content: z.string().optional(),
  boardId: z.string(),
  workspaceId: z.string(),
});

type InputType = z.infer<typeof UpdateBoardDocumentSchema>;

const handler = async (data: InputType) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { id, title, content, boardId, workspaceId } = data;

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

    // Update the document
    const updatedDocument = await db.boardDocument.update({
      where: {
        id,
        boardId,
      },
      data: {
        title: title !== undefined ? title : undefined,
        content: content !== undefined ? content : undefined,
      },
    });

    revalidatePath(`/${workspaceId}/boards/${boardId}/documents/${id}`);
    return { data: updatedDocument };
  } catch (error) {
    console.error("[UPDATE_BOARD_DOCUMENT_ERROR]", error);
    return { error: "Failed to update document" };
  }
};

export const updateBoardDocument = createSafeAction(
  UpdateBoardDocumentSchema,
  handler
);
