
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
    {
      id: "auto-move-completed",
      name: "Auto Move Completed Tasks",
      description: "Move cards to Done list when all tasks are completed",
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
        {
          type: "SEND_NOTIFICATION",
          config: {
            message: "All tasks completed - Card moved to Done",
          },
        },
      ],
    },
  ],
  TASK_MANAGEMENT: [
    {
      id: "task-completion-notification",
      name: "Task Completion Notification",
      description: "Send notification when a task is completed",
      trigger: {
        type: "TASK_COMPLETED",
      },
      actions: [
        {
          type: "SEND_NOTIFICATION",
          config: {
            message: "A task has been completed on your card",
          },
        },
      ],
    },
    {
      id: "high-priority-assignment",
      name: "High Priority Task Assignment",
      description: "Set card priority to high when specific tasks are added",
      trigger: {
        type: "TASK_ADDED",
      },
      actions: [
        {
          type: "UPDATE_CARD_PRIORITY",
          config: {
            priority: "HIGH",
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
        {
          type: "SEND_EMAIL",
          config: {
            subject: "You were mentioned in a comment",
            content: "Someone mentioned you in a comment",
          },
        },
      ],
    },
    {
      id: "card-assignment-notification",
      name: "Card Assignment Notification",
      description: "Send notification when a card is assigned",
      trigger: {
        type: "CARD_ASSIGNED",
      },
      actions: [
        {
          type: "SEND_NOTIFICATION",
          config: {
            message: "A card has been assigned to you",
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