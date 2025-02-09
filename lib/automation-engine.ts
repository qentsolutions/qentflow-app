import { db } from "@/lib/db";
import { sendBeautifulEmail } from "@/lib/mail";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

export class AutomationEngine {
  private static instance: AutomationEngine;

  private constructor() {}

  public static getInstance(): AutomationEngine {
    if (!AutomationEngine.instance) {
      AutomationEngine.instance = new AutomationEngine();
    }
    return AutomationEngine.instance;
  }

  async processAutomations(
    triggerType: any,
    context: any,
    workspaceId: string,
    boardId?: string
  ) {
    try {
      // Récupérer les automatisations actives pour ce trigger
      const automations = await db.automation.findMany({
        where: {
          workspaceId,
          boardId: boardId || undefined,
          active: true,
          trigger: {
            type: triggerType,
          },
        },
        include: {
          trigger: true,
          actions: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      for (const automation of automations) {
        if (this.evaluateConditions(automation.trigger.conditions, context)) {
          await this.executeActions(automation.actions, context, workspaceId);
        }
      }
    } catch (error) {
      console.error("Error processing automations:", error);
    }
  }

  private evaluateConditions(conditions: any, context: any): boolean {
    if (!conditions || Object.keys(conditions).length === 0) {
      return true;
    }

    // Logique d'évaluation des conditions
    try {
      for (const [key, value] of Object.entries(conditions)) {
        if (!this.evaluateCondition(key, value, context)) {
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error("Error evaluating conditions:", error);
      return false;
    }
  }

  private evaluateCondition(key: string, value: any, context: any): boolean {
    const contextValue = context[key];
    
    if (typeof value === "object") {
      if (value.operator === "equals") {
        return contextValue === value.value;
      }
      if (value.operator === "contains") {
        return contextValue.includes(value.value);
      }
      if (value.operator === "greaterThan") {
        return contextValue > value.value;
      }
      if (value.operator === "lessThan") {
        return contextValue < value.value;
      }
    }

    return contextValue === value;
  }

  private async executeActions(actions: any[], context: any, workspaceId: string) {
    for (const action of actions) {
      try {
        await this.executeAction(action, context, workspaceId);
      } catch (error) {
        console.error(`Error executing action ${action.type}:`, error);
      }
    }
  }

  private async executeAction(action: any, context: any, workspaceId: string) {
    switch (action.type) {
      case "UPDATE_CARD_STATUS":
        await this.updateCardStatus(action.config, context);
        break;
      case "ASSIGN_USER":
        await this.assignUser(action.config, context);
        break;
      case "SEND_NOTIFICATION":
        await this.sendNotification(action.config, context, workspaceId);
        break;
      case "CREATE_TASKS":
        await this.createTasks(action.config, context);
        break;
      case "ADD_TAG":
        await this.addTag(action.config, context);
        break;
      case "CREATE_CALENDAR_EVENT":
        await this.createCalendarEvent(action.config, context, workspaceId);
        break;
      case "CREATE_AUDIT_LOG":
        await this.createAuditLogEntry(action.config, context, workspaceId);
        break;
      case "SEND_EMAIL":
        await this.sendEmail(action.config, context);
        break;
      default:
        console.warn(`Unknown action type: ${action.type}`);
    }
  }

  private async updateCardStatus(config: any, context: any) {
    const { cardId } = context;
    const { listId } = config;

    await db.card.update({
      where: { id: cardId },
      data: { listId },
    });
  }

  private async assignUser(config: any, context: any) {
    const { cardId } = context;
    const { userId } = config;

    await db.card.update({
      where: { id: cardId },
      data: { assignedUserId: userId },
    });
  }

  private async sendNotification(config: any, context: any, workspaceId: string) {
    const { userId } = config;
    const { message } = config;

    await db.notification.create({
      data: {
        userId,
        workspaceId,
        message,
      },
    });
  }

  private async createTasks(config: any, context: any) {
    const { cardId } = context;
    const { tasks } = config;

    for (const task of tasks) {
      await db.task.create({
        data: {
          title: task.title,
          cardId,
          order: task.order || 0,
        },
      });
    }
  }

  private async addTag(config: any, context: any) {
    const { cardId } = context;
    const { tagId } = config;

    await db.card.update({
      where: { id: cardId },
      data: {
        tags: {
          connect: { id: tagId },
        },
      },
    });
  }

  private async createCalendarEvent(config: any, context: any, workspaceId: string) {
    const { title, startDate, endDate, userId } = config;

    await db.calendarEvent.create({
      data: {
        title,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        workspaceId,
        userId,
        cardId: context.cardId,
      },
    });
  }

  private async createAuditLogEntry(config: any, context: any, workspaceId: string) {
    const { action, entityType, entityTitle } = config;

    await createAuditLog({
      entityId: context.cardId,
      entityType: entityType as ENTITY_TYPE,
      entityTitle,
      action: action as ACTION,
      workspaceId,
    });
  }

  private async sendEmail(config: any, context: any) {
    const { to, subject, content } = config;

    await sendBeautifulEmail(
      to,
      subject,
      content
    );
  }
}

// Export une instance unique
export const automationEngine = AutomationEngine.getInstance();