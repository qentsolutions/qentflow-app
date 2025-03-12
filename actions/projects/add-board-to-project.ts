"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const AddBoardToProjectSchema = z.object({
  boardId: z.string(),
  projectId: z.string(),
  workspaceId: z.string(),
});

const handler = async (data: z.infer<typeof AddBoardToProjectSchema>) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { boardId, projectId, workspaceId } = data;

  try {
    // Verify the board exists and belongs to the workspace
    const board = await db.board.findFirst({
      where: {
        id: boardId,
        workspaceId,
      },
    });

    if (!board) {
      return { error: "Board not found" };
    }

    // Update the board to associate it with the project
    const updatedBoard = await db.board.update({
      where: {
        id: boardId,
      },
      data: {
        projectId,
      },
    });

    revalidatePath(`/${workspaceId}/projects/${projectId}`);
    return { data: updatedBoard };
  } catch (error) {
    return { error: "Failed to add board to project." };
  }
};

export const addBoardToProject = createSafeAction(AddBoardToProjectSchema, handler);