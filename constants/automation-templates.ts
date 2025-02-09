export const AUTOMATION_TEMPLATES = {
    CARD_MANAGEMENT: [
      {
        id: "auto-assign",
        name: "Auto Assign Cards",
        description: "Automatically assign cards to team members when moved to specific lists",
        trigger: {
          type: "CARD_MOVED",
          conditions: {
            destinationListId: null,
          },
        },
        actions: [
          {
            type: "ASSIGN_USER",
            config: {
              userId: null,
            },
          },
        ],
      },
      {
        id: "due-date-notification",
        name: "Due Date Notification",
        description: "Send notifications when cards are approaching their due date",
        trigger: {
          type: "DUE_DATE_APPROACHING",
          conditions: {
            daysBeforeDue: 2,
          },
        },
        actions: [
          {
            type: "SEND_NOTIFICATION",
            config: {
              message: "Card due date is approaching",
            },
          },
        ],
      },
    ],
    TASK_MANAGEMENT: [
      {
        id: "task-completion",
        name: "Task Completion Actions",
        description: "Automatically move cards when all tasks are completed",
        trigger: {
          type: "ALL_TASKS_COMPLETED",
        },
        actions: [
          {
            type: "MOVE_CARD",
            config: {
              listId: null,
            },
          },
        ],
      },
    ],
    NOTIFICATIONS: [
      {
        id: "mention-notification",
        name: "Mention Notifications",
        description: "Send notifications when users are mentioned in comments",
        trigger: {
          type: "USER_MENTIONED",
        },
        actions: [
          {
            type: "SEND_NOTIFICATION",
            config: {
              message: "@{user} mentioned you in a comment",
            },
          },
        ],
      },
    ],
  };
  
  export const AUTOMATION_CATEGORIES = [
    { id: "CARD_MANAGEMENT", label: "Card Management" },
    { id: "TASK_MANAGEMENT", label: "Task Management" },
    { id: "NOTIFICATIONS", label: "Notifications" },
  ];