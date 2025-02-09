"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const CreateAutomationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  workspaceId: z.string(),
  boardId: z.string().optional(),
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

const handler = async (data: z.infer<typeof CreateAutomationSchema>) => {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const { name, description, workspaceId, boardId, triggerType, triggerConditions, actions } = data;

    // Créer d'abord le trigger
    const trigger = await db.automationTrigger.create({
      data: {
        type: triggerType,
        conditions: triggerConditions || {},
      },
    });

    // Créer l'automatisation avec son trigger et ses actions
    const automation = await db.automation.create({
      data: {
        name,
        description,
        workspaceId,
        boardId,
        createdById: user.id,
        triggerId: trigger.id,
        actions: {
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
    console.error("Error creating automation:", error);
    return { error: "Failed to create automation." };
  }
};

export const createAutomation = createSafeAction(CreateAutomationSchema, handler);