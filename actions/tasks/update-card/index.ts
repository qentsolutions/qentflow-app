"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { UpdateCard } from "./schema";
import { InputType, ReturnType } from "./types";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { currentUser } from "@/lib/auth";

const handler = async (data: InputType): Promise<ReturnType> => {
  const user = currentUser();

  if (!user) {
    throw new Error("User not found!");
  }

  const { id, boardId, workspaceId, ...values } = data;
  let card;

  try {
    card = await db.card.update({
      where: {
        id,
        list: {
          board: {
            workspaceId,
          },
        },
      },
      data: {
        ...values,
      },
    });

    await createAuditLog({
      entityTitle: card.title,
      entityId: card.id,
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.UPDATE,
      workspaceId,
    });
  } catch (error) {
    return {
      error: "Failed to update.",
    };
  }

  revalidatePath(`/${workspaceId}board/${boardId}`);
  return { data: card };
};

export const updateCard = createSafeAction(UpdateCard, handler);
