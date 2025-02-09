"use server";

import { AutomationEngine } from "@/lib/automation-engine";
import { TriggerType } from "@prisma/client";

export const executeAutomation = async (
    triggerType: TriggerType,
    context: {
        boardId: string;
        workspaceId: string;
        userId?: string;
        cardId?: string;
        listId?: string;
    }
) => {
    try {
        await AutomationEngine.processTrigger(triggerType, context);
        return { success: "Automation executed successfully" };
    } catch (error) {
        console.error("Automation execution error:", error);
        return { error: "Failed to execute automation" };
    }
};