"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { UpdateBoard } from "./schema";
import { InputType, ReturnType } from "./types";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { currentUser } from "@/lib/auth";

const handler = async (data: InputType): Promise<ReturnType> => {
  const user = currentUser();

  if (!user) {
    throw new Error("User not found!");
  }


  const { title, id, workspaceId } = data;
  let board;

  try {
    board = await db.board.update({
      where: {
        id,
        workspaceId,
      },
      data: {
        title,
      },
    });

    await createAuditLog({
      entityTitle: board.title,
      entityId: board.id,
      entityType: ENTITY_TYPE.BOARD,
      action: ACTION.UPDATE,
      workspaceId,
    })
  } catch (error) {
    return {
      error: "Failed to update."
    }
  }

  revalidatePath(`/workspace/${workspaceId}board/${board.id}`);
  return { data: board };
};

export const updateBoard = createSafeAction(UpdateBoard, handler);
