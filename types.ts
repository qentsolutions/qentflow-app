import { Card, List, Tag, Document, RelationshipType } from "@prisma/client";

export type CardWithList = Card & {
  list: List;
  tags: Tag[];
  documents: Document[];
  _count: {
    comments: number;
    attachments: number;
  };
  tasks?: {
    id: string;
    completed: boolean;
  }[];
  priority: string | null;
  assignedUserId?: string | null;
  startDate?: Date | null;
  dueDate?: Date | null;
  parent?: CardWithList | null;
  children?: CardWithList[];
  sourceRelationships?: CardRelationship[];
  destinationRelationships?: CardRelationship[];
};

export type CardRelationship = {
  id: string;
  sourceCardId: string;
  destCardId: string;
  relationshipType: RelationshipType;
  sourceCard?: CardWithList;
  destCard?: CardWithList;
  createdAt: Date;
  updatedAt: Date;
};

export type ListWithCards = List & {
  cards: CardWithList[];
  order: number;
  boardId: string;
  createdAt: Date;
  updatedAt: Date;
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