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

  private async logAutomationActivity(
    automationId: string,
    workspaceId: string,
    boardId: string | undefined,
    type: string,
    description: string,
    status: "success" | "error" = "success",
    error?: string
  ) {
    try {
      await db.automationActivity.create({
        data: {
          automationId,
          workspaceId,
          boardId,
          type,
          description,
          status,
          error,
        },
      });
    } catch (error) {
      console.error("Failed to log automation activity:", error);
    }
  }

  async processAutomations(
    triggerType: any,
    context: any,
    workspaceId: string,
    boardId?: string
  ) {
    try {
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

      const board = await db.board.findUnique({
        where: { id: boardId },
        include: {
          lists: true,
        },
      });

      if (!board) {
        console.error("Board not found:", boardId);
        return;
      }

      for (const automation of automations) {
        try {
          // Log the start of automation execution
          await this.logAutomationActivity(
            automation.id,
            workspaceId,
            boardId,
            triggerType,
            `Starting automation "${automation.name}"`,
            "success"
          );

          if (this.evaluateConditions(automation.trigger.conditions, context)) {
            try {
              await this.executeActions(automation.actions, {
                ...context,
                triggerType,
                board
              }, workspaceId, board);

              // Log successful execution
              await this.logAutomationActivity(
                automation.id,
                workspaceId,
                boardId,
                triggerType,
                `Successfully executed automation "${automation.name}"`,
                "success"
              );
            } catch (error) {
              // Log action execution failure
              await this.logAutomationActivity(
                automation.id,
                workspaceId,
                boardId,
                triggerType,
                `Failed to execute automation "${automation.name}"`,
                "error",
                error instanceof Error ? error.message : "Unknown error"
              );
              throw error;
            }
          } else {
            // Log when conditions are not met
            await this.logAutomationActivity(
              automation.id,
              workspaceId,
              boardId,
              triggerType,
              `Conditions not met for automation "${automation.name}"`,
              "success"
            );
          }
        } catch (error) {
          console.error(`Error processing automation ${automation.id}:`, error);
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

  private async executeActions(actions: any[], context: any, workspaceId: string, board: any) {
    for (const action of actions) {
      try {
        await this.executeAction(action, context, workspaceId, board);
      } catch (error) {
        console.error(`Error executing action ${action.type}:`, error);
        throw error;
      }
    }
  }

  private getEmailTemplate(triggerType: string, context: any, board: any) {
    const templates: { [key: string]: { subject: string; content: string } } = {
      CARD_CREATED: {
        subject: `New Card Created in Board "${board.title}"`,
        content: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #2563eb;">New Card Created</h2>
            <p>A new card has been created in your board.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p><strong>Card Title:</strong> ${context.title}</p>
              <p><strong>Board:</strong> ${board.title}</p>
              <p><strong>List:</strong> ${context.listTitle}</p>
              <p><strong>Created By:</strong> ${context.createdBy?.name || 'Unknown'}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              You are receiving this email because you are subscribed to board notifications.
            </p>
          </div>
        `,
      },
      CARD_MOVED: {
        subject: `Card Moved in Board "${board.title}"`,
        content: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #2563eb;">Card Moved</h2>
            <p>A card has been moved to a different list.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p><strong>Card Title:</strong> ${context.title}</p>
              <p><strong>From List:</strong> ${context.sourceListTitle}</p>
              <p><strong>To List:</strong> ${context.destinationListTitle}</p>
            </div>
          </div>
        `,
      },
      // Add more email templates as needed
    };

    return templates[triggerType] || {
      subject: `Notification from Board "${board.title}"`,
      content: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #2563eb;">Board Notification</h2>
          <p>An action has occurred in your board.</p>
        </div>
      `,
    };
  }

  private async executeAction(action: any, context: any, workspaceId: string, board: any) {
    const { cardId } = context;

    try {
      switch (action.type) {
        case "UPDATE_CARD_PRIORITY":
          await db.card.update({
            where: { id: cardId },
            data: { 
              priority: action.config.priority 
            },
          });
          break;

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
          const user = await db.user.findUnique({
            where: { id: action.config.userId },
          });

          if (!user?.email) {
            throw new Error("No email found for user");
          }

          const template = this.getEmailTemplate(context.triggerType, context, board);
          
          await sendBeautifulEmail(
            user.email,
            template.subject,
            template.content
          );
          break;

        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      // Log successful action execution
      await this.logAutomationActivity(
        context.automationId,
        workspaceId,
        board.id,
        action.type,
        `Successfully executed action "${action.type}"`,
        "success"
      );
    } catch (error) {
      // Log failed action execution
      await this.logAutomationActivity(
        context.automationId,
        workspaceId,
        board.id,
        action.type,
        `Failed to execute action "${action.type}"`,
        "error",
        error instanceof Error ? error.message : "Unknown error"
      );
      throw error;
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
}

export const automationEngine = AutomationEngine.getInstance();