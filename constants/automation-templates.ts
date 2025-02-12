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
    {
      id: "auto-tag-new-cards",
      name: "Auto Tag New Cards",
      description: "Automatically tag new cards with a specific label",
      trigger: {
        type: "CARD_CREATED",
      },
      actions: [
        {
          type: "ADD_TAG",
          config: {
            tag: "New",
          },
        },
      ],
    },
    {
      id: "move-card-on-update",
      name: "Move Card to Another Board on Update",
      description: "Move cards to a specific list when they are updated",
      trigger: {
        type: "CARD_UPDATED",
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
    {
      id: "create-task-on-comment",
      name: "Create Task on Comment",
      description: "Automatically create a task when a comment is added",
      trigger: {
        type: "COMMENT_ADDED",
      },
      actions: [
        {
          type: "CREATE_TASKS",
          config: {
            taskName: "Follow up on comment",
          },
        },
      ],
    },
    {
      id: "task-added-notification",
      name: "Task Added Notification",
      description: "Send notification when a new task is added to a card",
      trigger: {
        type: "TASK_ADDED",
      },
      actions: [
        {
          type: "SEND_NOTIFICATION",
          config: {
            message: "A new task has been added to your card",
          },
        },
      ],
    },
    {
      id: "auto-create-tasks",
      name: "Auto Create Tasks",
      description: "Automatically create tasks when a card is created",
      trigger: {
        type: "CARD_CREATED",
      },
      actions: [
        {
          type: "CREATE_TASKS",
          config: {
            tasks: ["Task 1", "Task 2", "Task 3"],
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
    {
      id: "comment-added-notification",
      name: "Comment Added Notification",
      description: "Send notification when a comment is added to a card",
      trigger: {
        type: "COMMENT_ADDED",
      },
      actions: [
        {
          type: "SEND_NOTIFICATION",
          config: {
            message: "A new comment has been added to your card",
          },
        },
      ],
    },
    {
      id: "attachment-added-notification",
      name: "Attachment Added Notification",
      description: "Send notification when an attachment is added to a card",
      trigger: {
        type: "ATTACHMENT_ADDED",
      },
      actions: [
        {
          type: "SEND_NOTIFICATION",
          config: {
            message: "A new attachment has been added to your card",
          },
        },
      ],
    },
    {
      id: "card-updated-notification",
      name: "Card Updated Notification",
      description: "Send notification when a card is updated",
      trigger: {
        type: "CARD_UPDATED",
      },
      actions: [
        {
          type: "SEND_NOTIFICATION",
          config: {
            message: "Your card has been updated",
          },
        },
      ],
    },
  ],
  CALENDAR_INTEGRATION: [
    {
      id: "create-event-on-due-date",
      name: "Create Calendar Event on Due Date",
      description: "Automatically create a calendar event when a card's due date is approaching",
      trigger: {
        type: "DUE_DATE_APPROACHING",
        conditions: {
          daysBeforeDue: 1,
        },
      },
      actions: [
        {
          type: "CREATE_CALENDAR_EVENT",
          config: {
            eventName: "Card Due Date",
            eventDescription: "This card is due tomorrow",
          },
        },
      ],
    },
    {
      id: "create-event-on-task-completion",
      name: "Create Calendar Event on Task Completion",
      description: "Automatically create a calendar event when all tasks are completed",
      trigger: {
        type: "ALL_TASKS_COMPLETED",
      },
      actions: [
        {
          type: "CREATE_CALENDAR_EVENT",
          config: {
            eventName: "All Tasks Completed",
            eventDescription: "All tasks on this card are completed",
          },
        },
      ],
    },
  ],
  AUDIT_LOGS: [
    {
      id: "log-card-creation",
      name: "Log Card Creation",
      description: "Create an audit log entry when a card is created",
      trigger: {
        type: "CARD_CREATED",
      },
      actions: [
        {
          type: "CREATE_AUDIT_LOG",
          config: {
            logMessage: "Card created",
          },
        },
      ],
    },
    {
      id: "log-card-assignment",
      name: "Log Card Assignment",
      description: "Create an audit log entry when a card is assigned",
      trigger: {
        type: "CARD_ASSIGNED",
      },
      actions: [
        {
          type: "CREATE_AUDIT_LOG",
          config: {
            logMessage: "Card assigned to user",
          },
        },
      ],
    },
    {
      id: "log-task-completion",
      name: "Log Task Completion",
      description: "Create an audit log entry when a task is completed",
      trigger: {
        type: "TASK_COMPLETED",
      },
      actions: [
        {
          type: "CREATE_AUDIT_LOG",
          config: {
            logMessage: "Task completed",
          },
        },
      ],
    },
  ],
  PRIORITY_MANAGEMENT: [
    {
      id: "set-high-priority-on-due-date",
      name: "Set High Priority on Due Date",
      description: "Set card priority to high when due date is approaching",
      trigger: {
        type: "DUE_DATE_APPROACHING",
        conditions: {
          daysBeforeDue: 3,
        },
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
    {
      id: "set-low-priority-on-task-completion",
      name: "Set Low Priority on Task Completion",
      description: "Set card priority to low when all tasks are completed",
      trigger: {
        type: "ALL_TASKS_COMPLETED",
      },
      actions: [
        {
          type: "UPDATE_CARD_PRIORITY",
          config: {
            priority: "LOW",
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
  { id: "CALENDAR_INTEGRATION", label: "Calendar Integration" },
  { id: "AUDIT_LOGS", label: "Audit Logs" },
  { id: "PRIORITY_MANAGEMENT", label: "Priority Management" },
];
