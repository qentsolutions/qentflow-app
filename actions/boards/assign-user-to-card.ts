"use server";

import { db } from "@/lib/db";
import { z } from "zod";
import { automationEngine } from "@/lib/automation-engine";

const assignUserSchema = z.object({
  cardId: z.string(),
  userId: z.string().nullable().optional(),
});

export async function assignUserToCard(cardId: string, userId: string | null) {
  try {
    // Get the card with its list and board information
    const card = await db.card.findUnique({
      where: { id: cardId },
      include: {
        list: {
          include: {
            board: true,
          },
        },
      },
    });

    if (!card) {
      throw new Error("Card not found");
    }

    // Update the card with the new assignee
    const updatedCard = await db.card.update({
      where: { id: cardId },
      data: {
        assignedUserId: userId === "null" ? null : userId,
      },
    });

    // Trigger automation for card assignment
    if (userId && userId !== "null") {
      await automationEngine.processAutomations(
        "CARD_ASSIGNED",
        {
          cardId: card.id,
          assignedUserId: userId,
          title: card.title,
        },
        card.list.board.workspaceId,
        card.list.boardId
      );
    }

    return updatedCard;
  } catch (error) {
    console.error("Error in assignUserToCard:", error);
    throw error;
  }
}
