"use server";

import { db } from "@/lib/db";
import { z } from "zod";
import { createNotification } from "../notifications/create-notification";

const assignUserSchema = z.object({
  cardId: z.string(),
  userId: z.string().nullable().optional(),
});

export async function assignUserToCard(cardId: string, userId: string) {
  try {
    // Validate input
    assignUserSchema.parse({ cardId, userId });

    // Check if card exists
    const card = await db.card.findUnique({
      where: { id: cardId },
      include: {
        list: {
          include: {
            board: {
              include: {
                User: true,
              },
            },
          },
        },
      },
    });

    if (!card) {
      return { success: false, error: "Card not found" };
    }

    // Si userId est "null", on désassigne l'utilisateur
    const updateData =
      userId === "null" ? { assignedUserId: null } : { assignedUserId: userId };

    // Update card with assigned user or remove assignment
    const updatedCard = await db.card.update({
      where: { id: cardId },
      data: updateData,
    });

    const workspaceId = card.list.board.workspaceId;
    await createNotification(
      userId,
      workspaceId,
      `You have been assigned a new card: ${card.title}`
    );

    return { success: true, data: updatedCard };
  } catch (error) {
    console.error("Error assigning user to card:", error);
    return { success: false, error: "Failed to assign user" };
  }
}
