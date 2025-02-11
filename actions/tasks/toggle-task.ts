"use server";

import { db } from "@/lib/db";
import { automationEngine } from "@/lib/automation-engine";

export async function toggleTask(
  taskId: string,
  completed: boolean,
  cardId: string,
  workspaceId: string,
  boardId: string
) {
  try {
    // Update task status
    const task = await db.task.update({
      where: { id: taskId },
      data: { completed },
    });

    // Get all tasks for the card
    const tasks = await db.task.findMany({
      where: { cardId },
    });

    // Check if all tasks are completed
    const allTasksCompleted = tasks.every((task) => task.completed);

    // If a task was completed, trigger TASK_COMPLETED automation
    if (completed) {
      await automationEngine.processAutomations(
        "TASK_COMPLETED",
        {
          taskId,
          cardId,
          title: task.title,
        },
        workspaceId,
        boardId
      );
    }

    // If all tasks are completed, trigger ALL_TASKS_COMPLETED automation
    if (allTasksCompleted) {
      await automationEngine.processAutomations(
        "ALL_TASKS_COMPLETED",
        {
          cardId,
          totalTasks: tasks.length,
        },
        workspaceId,
        boardId
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error toggling task:", error);
    return { error: "Failed to toggle task" };
  }
}
