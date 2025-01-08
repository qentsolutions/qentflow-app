"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";

import { UpdateComment } from "./schema";
import { InputType, ReturnType } from "./types";
import { currentUser } from "@/lib/auth";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

const handler = async (data: InputType): Promise<ReturnType> => {
  const user = await currentUser(); // Assurez-vous que la fonction est asynchrone

  if (!user) {
    throw new Error("User not found!");
  }

  const { commentId, workspaceId, boardId, text } = data; // Ajout de `text` dans les données d'entrée

  if (!text || text.trim().length === 0) {
    return { error: "Comment text cannot be empty" };
  }

  try {
    // Vérifie si le commentaire existe
    const comment = await db.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return { error: "Comment not found" };
    }

    // Vérifie si l'utilisateur est le créateur du commentaire
    if (comment.userId !== user.id) {
      return { error: "You are not authorized to update this comment" };
    }

    // Met à jour le commentaire
    const updatedComment = await db.comment.update({
      where: { id: commentId },
      data: {
        text, // Met à jour le texte du commentaire
        updatedAt: new Date(), // Met à jour l'horodatage
        modified: true,
      },
    });

    // Crée un audit log
    await createAuditLog({
      entityId: updatedComment.id,
      entityTitle: `Updated comment: ${updatedComment.text}`,
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.UPDATE,
      workspaceId,
      userId: user.id,
    });

    // Revalide la page pour mettre à jour l'interface utilisateur
    revalidatePath(`/${workspaceId}/boards/${boardId}`);

    return {};
  } catch (error) {
    console.error("Error updating comment:", error);
    return { error: "Failed to update comment." };
  }
};

export const updateComment = createSafeAction(UpdateComment, handler);
