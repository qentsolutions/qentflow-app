"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ActionType, Prisma, TriggerType } from "@prisma/client";
import { z } from "zod";

// Schéma de validation pour la création d'une règle d'automatisation
const AutomationRuleSchema = z.object({
    boardId: z.string().min(1, "Board ID is required"),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    triggers: z.array(
        z.object({
            type: z.nativeEnum(TriggerType),  // ✅ Vérifie que type est bien une valeur de TriggerType
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


export const updateAutomationRule = async (id: string, data: z.infer<typeof AutomationRuleSchema>) => {
    const validated = AutomationRuleSchema.safeParse(data);

    if (!validated.success) {
        return { error: "Invalid data" };
    }

    const { name, description, triggers, actions } = validated.data;

    const user = await currentUser();
    if (!user) {
        return { error: "Unauthorized" };
    }

    const automationRule = await db.automationRule.findFirst({
        where: {
            id,
            board: {
                workspace: {
                    members: {
                        some: {
                            userId: user.id,
                        },
                    },
                },
            },
        },
        include: {
            triggers: true,
            actions: true,
        },
    });

    if (!automationRule) {
        return { error: "Automation rule not found or unauthorized" };
    }

    // Mettre à jour la règle d'automatisation
    await db.automationRule.update({
        where: { id },
        data: {
            name,
            description,
            triggers: {
                deleteMany: {},
                createMany: {
                    data: triggers.map((trigger) => ({
                        type: trigger.type,
                        configuration: trigger.configuration as Prisma.JsonValue ?? Prisma.JsonNull,
                    })),
                },
            },
            actions: {
                deleteMany: {},
                createMany: {
                    data: actions.map((action) => ({
                        type: action.type,
                        configuration: action.configuration as Prisma.JsonValue ?? Prisma.JsonNull,
                    })),
                },
            },
        },
    });

    return { success: "Automation rule updated successfully" };
};

