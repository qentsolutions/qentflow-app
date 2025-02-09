import { TriggerType, ActionType, Card, List, Board, User } from "@prisma/client";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

interface AutomationContext {
    boardId: string;
    workspaceId: string;
    userId?: string;
    card?: Card;
    list?: List;
}

export class AutomationEngine {
    private static async executeAction(
        action: { type: ActionType; configuration: any },
        context: AutomationContext
    ) {
        switch (action.type) {
            case "UPDATE_CARD_STATUS":
                await this.updateCardStatus(action.configuration, context);
                break;
            case "ASSIGN_CARD":
                await this.assignCard(action.configuration, context);
                break;
            case "SEND_NOTIFICATION":
                await this.sendNotification(action.configuration, context);
                break;
            // Add more action handlers
        }
    }

    private static async updateCardStatus(config: any, context: AutomationContext) {
        if (!context.card) return;

        await db.card.update({
            where: { id: context.card.id },
            data: { listId: config.targetListId },
        });

        await createAuditLog({
            entityId: context.card.id,
            entityTitle: context.card.title,
            entityType: ENTITY_TYPE.CARD,
            action: ACTION.UPDATE,
            workspaceId: context.workspaceId,
        });
    }

    private static async assignCard(config: any, context: AutomationContext) {
        if (!context.card) return;

        await db.card.update({
            where: { id: context.card.id },
            data: { assignedUserId: config.userId },
        });

        await createAuditLog({
            entityId: context.card.id,
            entityTitle: context.card.title,
            entityType: ENTITY_TYPE.CARD,
            action: ACTION.UPDATE,
            workspaceId: context.workspaceId,
        });
    }

    private static async sendNotification(config: any, context: AutomationContext) {
        await db.notification.create({
            data: {
                userId: config.userId,
                workspaceId: context.workspaceId,
                message: config.message,
            },
        });
    }

    public static async processTrigger(
        triggerType: TriggerType,
        context: AutomationContext
    ) {
        const rules = await db.automationRule.findMany({
            where: {
                boardId: context.boardId,
                isActive: true,
                triggers: {
                    some: {
                        type: triggerType,
                    },
                },
            },
            include: {
                triggers: true,
                actions: true,
            },
        });

        for (const rule of rules) {
            for (const action of rule.actions) {
                await this.executeAction(action, context);
            }
        }
    }
}