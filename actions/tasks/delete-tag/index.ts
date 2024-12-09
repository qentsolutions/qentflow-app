// actions/tasks/delete-tag/index.ts
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { InputType, ReturnType } from "./types";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { DeleteTag } from "./schema";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { id, boardId, workspaceId } = data;

  try {
    const tag = await db.tag.delete({
      where: {
        id,
        boardId,
      },
    });

    await createAuditLog({
      entityTitle: tag.name,
      entityId: tag.id,
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.DELETE,
      workspaceId,
    });

    revalidatePath(`/${workspaceId}/boards/${boardId}`);
    return { data: tag };
  } catch (error) {
    return {
      error: "Failed to delete tag.",
    };
  }
};

export const deleteTag = createSafeAction(DeleteTag, handler);
