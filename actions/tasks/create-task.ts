"use server";

import { db } from "@/lib/db";
import { automationEngine } from "@/lib/automation-engine";

export async function createTask(
  title: string,
  cardId: string,
  order: number,
  workspaceId: string,
  boardId: string
) {
  try {
    const task = await db.task.create({
      data: {
        title,
        cardId,
        order,
      },
    });

    // Trigger automation for task added
    await automationEngine.processAutomations(
      "TASK_ADDED",
      {
        taskId: task.id,
        cardId,
        title: task.title,
      },
      workspaceId,
      boardId
    );

    return { success: true, task };
  } catch (error) {
    console.error("Error creating task:", error);
    return { error: "Failed to create task" };
  }
}
