"use server";

import { db } from "@/lib/db";
import { automationEngine } from "@/lib/automation-engine";
import { addDays, isWithinInterval } from "date-fns";

export async function checkDueDates() {
  try {
    // Get all cards with due dates
    const cards = await db.card.findMany({
      where: {
        dueDate: {
          not: null,
        },
      },
      include: {
        list: {
          include: {
            board: true,
          },
        },
      },
    });

    const now = new Date();

    for (const card of cards) {
      if (!card.dueDate) continue;

      // Get the automation for this card's board that has DUE_DATE_APPROACHING trigger
      const automations = await db.automation.findMany({
        where: {
          boardId: card.list.boardId,
          active: true,
          trigger: {
            type: "DUE_DATE_APPROACHING",
          },
        },
        include: {
          trigger: true,
        },
      });

      for (const automation of automations) {
        const daysBeforeDue = automation.trigger.conditions?.daysBeforeDue || 1;
        const warningDate = addDays(card.dueDate, -daysBeforeDue);

        // Check if current date is within the warning period
        if (
          isWithinInterval(now, {
            start: addDays(warningDate, -1), // To avoid multiple triggers
            end: warningDate,
          })
        ) {
          await automationEngine.processAutomations(
            "DUE_DATE_APPROACHING",
            {
              cardId: card.id,
              dueDate: card.dueDate,
              daysUntilDue: daysBeforeDue,
              title: card.title,
            },
            card.list.board.workspaceId,
            card.list.boardId
          );
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error checking due dates:", error);
    return { error: "Failed to check due dates" };
  }
}
