"use server";

import { db } from "@/lib/db";
import { z } from "zod";

const assignUserSchema = z.object({
  cardId: z.string(),
  userId: z.string(),
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
                User: true
              }
            }
          }
        }
      }
    });

    if (!card) {
      return { success: false, error: "Card not found" };
    }

    // Check if user is member of the board
    const isBoardMember = card.list.board.User.some(user => user.id === userId);
    if (!isBoardMember) {
      return { success: false, error: "User is not a member of this board" };
    }

    // Update card with assigned user
    const updatedCard = await db.card.update({
      where: { id: cardId },
      data: { assignedUserId: userId },
    });

    return { success: true, data: updatedCard };
  } catch (error) {
    console.error("Error assigning user to card:", error);
    return { success: false, error: "Failed to assign user" };
  }
}