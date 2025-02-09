"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const UpdateAutomationSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  workspaceId: z.string(),
  boardId: z.string().optional(),
  active: z.boolean(),
  triggerType: z.enum([
    "CARD_CREATED",
    "CARD_MOVED",
    "CARD_UPDATED",
    "TASK_COMPLETED",
    "COMMENT_ADDED",
    "ATTACHMENT_ADDED",
    "DUE_DATE_APPROACHING",
    "ALL_TASKS_COMPLETED",
    "USER_MENTIONED",
    "CARD_ASSIGNED",
  ]),
  triggerConditions: z.record(z.any()).optional(),
  actions: z.array(
    z.object({
      id: z.string().optional(),
      type: z.enum([
        "UPDATE_CARD_STATUS",
        "ASSIGN_USER",
        "SEND_NOTIFICATION",
        "CREATE_TASKS",
        "ADD_TAG",
        "CREATE_CALENDAR_EVENT",
        "CREATE_AUDIT_LOG",
        "MOVE_CARD",
        "UPDATE_CARD_PRIORITY",
        "SEND_EMAIL",
      ]),
      config: z.record(z.any()),
      order: z.number(),
    })
  ),
});

const handler = async (data: z.infer<typeof UpdateAutomationSchema>) => {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const {
      id,
      name,
      description,
      workspaceId,
      boardId,
      active,
      triggerType,
      triggerConditions,
      actions,
    } = data;

    // Mise à jour de l'automatisation
    const automation = await db.automation.update({
      where: {
        id,
        workspaceId,
      },
      data: {
        name,
        description,
        active,
        boardId,
        trigger: {
          update: {
            type: triggerType,
            conditions: triggerConditions || {},
          },
        },
        actions: {
          deleteMany: {},
          create: actions.map((action) => ({
            type: action.type,
            config: action.config,
            order: action.order,
          })),
        },
      },
      include: {
        trigger: true,
        actions: true,
      },
    });

    revalidatePath(`/${workspaceId}/boards/${boardId}`);
    return { data: automation };
  } catch (error) {
    return { error: "Failed to update automation." };
  }
};

export const updateAutomation = createSafeAction(
  UpdateAutomationSchema,
  handler
);
