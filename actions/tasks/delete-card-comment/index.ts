"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";

import { DeleteComment } from "./schema";
import { InputType, ReturnType } from "./types";
import { currentUser } from "@/lib/auth";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

const handler = async (data: InputType): Promise<ReturnType> => {
  const user = currentUser();

  if (!user) {
    throw new Error("User not found!");
  }
  const { commentId, workspaceId, boardId, userId } = data;

  try {
    // Vérifie si le commentaire existe
    const comment = await db.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return {
        error: "Comment not found",
      };
    }

    // Vérifie si l'utilisateur est le créateur du commentaire
    if (comment.userId !== userId) {
      return {
        error: "You are not authorized to delete this comment",
      };
    }

    // Supprime le commentaire
    await db.comment.delete({
      where: { id: commentId },
    });

    // Crée un audit log
    await createAuditLog({
      entityId: comment.id,
      entityTitle: `Deleted comment: ${comment.text}`,
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.DELETE,
      workspaceId,
    });

    // Revalide la page pour mettre à jour l'interface utilisateur
    revalidatePath(`/workspace/${workspaceId}/board/${boardId}`);

    return {};
  } catch (error) {
    return {
      error: "Failed to create comment.",
    };
  }
};

export const deleteComment = createSafeAction(DeleteComment, handler);
