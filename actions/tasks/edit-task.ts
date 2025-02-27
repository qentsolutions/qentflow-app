"use server";

import { db } from "@/lib/db";
import { automationEngine } from "@/lib/automation-engine";

export async function editTask(
  taskId: string,
  title: string,
  completed: boolean,
  order: number,
) {
  try {
    const task = await db.task.update({
      where: { id: taskId },
      data: {
        title,
        completed,
        order,
      },
    });

    return { success: true, task };
  } catch (error) {
    console.error("Error editing task:", error);
    return { error: "Failed to edit task" };
  }
}
