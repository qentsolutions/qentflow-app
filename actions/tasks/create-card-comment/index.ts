"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";

import { CreateComment } from "./schema";
import { InputType, ReturnType } from "./types";
import { currentUser } from "@/lib/auth";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

const handler = async (data: InputType): Promise<ReturnType> => {
  const user = currentUser();

  if (!user) {
    throw new Error("User not found!");
  }

  const { cardId, text, workspaceId, boardId, userId } = data;

  try {
    // Vérifie si la carte existe
    const card = await db.card.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      return {
        error: "Card not found",
      };
    }

    // Crée le commentaire
    const comment = await db.comment.create({
      data: {
        text,
        cardId,
        userId,
      },
    });

    // Crée un audit log
    await createAuditLog({
      entityId: comment.id,
      entityTitle: `Comment on card: ${card.title}`,
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.CREATE,
      workspaceId,
    });

    // Revalide la page pour mettre à jour l'interface utilisateur
    revalidatePath(`/${workspaceId}/board/${boardId}`);

    return { data: comment };
  } catch (error) {
    return {
      error: "Failed to create comment.",
    };
  }
};

export const createComment = createSafeAction(CreateComment, handler);
