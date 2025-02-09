"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ActionType, Prisma, TriggerType } from "@prisma/client";
import { z } from "zod";

// Schéma de validation pour la création d'une règle d'automatisation

// Schéma de validation pour la création d'une règle d'automatisation
const AutomationRuleSchema = z.object({
    boardId: z.string().min(1, "Board ID is required"),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    triggers: z.array(
        z.object({
            type: z.nativeEnum(TriggerType), // Utilisez le type Prisma ici
            configuration: z.record(z.any()).optional(),
        })
    ),
    actions: z.array(
        z.object({
            type: z.nativeEnum(ActionType), // Utilisez le type Prisma ici
            configuration: z.record(z.any()).optional(),
        })
    ),
});

// Créer une règle d'automatisation
export const createAutomationRule = async (data: z.infer<typeof AutomationRuleSchema>) => {
    const validated = AutomationRuleSchema.safeParse(data);

    if (!validated.success) {
        return { error: "Invalid data" };
    }

    const { boardId, name, description, triggers, actions } = validated.data;

    const user = await currentUser();
    if (!user) {
        return { error: "Unauthorized" };
    }

    // Vérifier si l'utilisateur a accès au tableau
    const board = await db.board.findFirst({
        where: {
            id: boardId,
            workspace: {
                members: {
                    some: {
                        userId: user.id,
                    },
                },
            },
        },
    });

    if (!board) {
        return { error: "Board not found or unauthorized" };
    }

    // Créer la règle d'automatisation
    const automationRule = await db.automationRule.create({
        data: {
            name,
            description,
            boardId,
            triggers: {
                createMany: {
                    data: triggers.map((trigger) => ({
                        type: trigger.type,
                        configuration: trigger.configuration as Prisma.JsonValue ?? Prisma.JsonNull, // Forcer le type Prisma.JsonValue
                    })),
                },
            },
            actions: {
                createMany: {
                    data: actions.map((action) => ({
                        type: action.type,
                        configuration: action.configuration as Prisma.JsonValue ?? Prisma.JsonNull, // Forcer le type Prisma.JsonValue
                    })),
                },
            },
        },
    });



    return { success: "Automation rule created successfully", automationRule };
};


