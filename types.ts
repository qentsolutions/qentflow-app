import { Card, List, Tag, Document } from "@prisma/client";

export type ListWithCards = List & {
  cards: Card[];
};

export type CardWithList = Card & {
  list: List;
  tags: Tag[];
  documents: Document[];
};
export type Comment = {
  id: string;
  text: string;
  createdAt: string;
  modified: boolean;
  user: {
    id: any;
    image: string;
    name: string;
  };
};

export interface Point {
  x: number;
  y: number;
}

export interface WhiteboardElement {
  id: string;
  type: "rectangle" | "circle" | "arrow" | "text";
  startPoint: Point;
  endPoint?: Point;
  color: string;
  strokeWidth: number;
  strokeStyle: "solid" | "dashed" | "dotted";
  backgroundColor?: string;
  text?: string;
  width?: number;
  height?: number;
  isSelected?: boolean;
  connectorPoints?: {
    top: Point;
    right: Point;
    bottom: Point;
    left: Point;
  };
  connectedTo?: string[];
}

export interface WhiteboardState {
  elements: WhiteboardElement[];
  selectedElement: WhiteboardElement | null;
  isDrawing: boolean;
  currentTool: "select" | "rectangle" | "circle" | "arrow" | "text";
  currentColor: string;
  currentStrokeWidth: number;
  currentStrokeStyle: "solid" | "dashed" | "dotted";
  currentBackgroundColor: string;
  showConnectors: boolean;
  nearestConnector: { elementId: string; point: Point } | null;
}

export interface StyleOptions {
  strokeWidth: number;
  strokeStyle: "solid" | "dashed" | "dotted";
  backgroundColor: string;
}

export enum TriggerType {
  CARD_MOVED = "CARD_MOVED",
  CARD_CREATED = "CARD_CREATED",
  TASK_COMPLETED = "TASK_COMPLETED",
  COMMENT_ADDED = "COMMENT_ADDED",
  DUE_DATE_APPROACHING = "DUE_DATE_APPROACHING",
  ATTACHMENT_ADDED = "ATTACHMENT_ADDED",
}

export enum ActionType {
  UPDATE_CARD_STATUS = "UPDATE_CARD_STATUS",
  ASSIGN_CARD = "ASSIGN_CARD",
  SEND_NOTIFICATION = "SEND_NOTIFICATION",
  GENERATE_TASKS = "GENERATE_TASKS",
  APPLY_TAG = "APPLY_TAG",
  CREATE_CALENDAR_EVENT = "CREATE_CALENDAR_EVENT",
  SAVE_ATTACHMENT = "SAVE_ATTACHMENT",
}

export interface Trigger {
  type: TriggerType;
  configuration?: Record<string, any>;
}

export interface Action {
  type: ActionType;
  configuration?: Record<string, any>;
}

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  triggers: Trigger[];
  actions: Action[];
}

export interface Board {
  id: string;
  name: string;
  lists: {
    id: string;
    title: string;
  }[];
  automationRules: AutomationRule[];
}

