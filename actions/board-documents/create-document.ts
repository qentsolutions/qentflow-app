"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const CreateBoardDocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  boardId: z.string(),
  workspaceId: z.string(),
  folderId: z.string().optional(),
});

type InputType = z.infer<typeof CreateBoardDocumentSchema>;

const handler = async (data: InputType) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { title, content, boardId, workspaceId, folderId } = data;

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

    // If a folder ID is provided, check if it exists
    if (folderId) {
      const folder = await db.boardFolder.findUnique({
        where: {
          id: folderId,
          boardId,
        },
      });

      if (!folder) {
        return { error: "Folder not found" };
      }
    }

    // Get the highest order value to place the new document at the end
    const highestOrder = await db.boardDocument.findFirst({
      where: {
        boardId,
        folderId: folderId || null,
      },
      orderBy: {
        order: "desc",
      },
      select: {
        order: true,
      },
    });

    const newOrder = highestOrder ? highestOrder.order + 1 : 0;

    // Create the document
    const document = await db.boardDocument.create({
      data: {
        title,
        content: content || "",
        boardId,
        folderId: folderId || null,
        createdById: user.id,
        order: newOrder,
      },
    });

    revalidatePath(`/${workspaceId}/boards/${boardId}/documents`);
    return { data: document };
  } catch (error) {
    console.error("[CREATE_BOARD_DOCUMENT_ERROR]", error);
    return { error: "Failed to create document" };
  }
};

export const createBoardDocument = createSafeAction(
  CreateBoardDocumentSchema,
  handler
);
