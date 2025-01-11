"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { createSafeAction } from "@/lib/create-safe-action";
import { CreateDocument } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  const user = await currentUser();

  if (!user) {
    return {
      error: "Unauthorized",
    };
  }

  const { title, workspaceId } = data;

  let document;

  try {
    document = await db.document.create({
      data: {
        title,
        workspaceId,
        createdById: user.id,
        content: "",
      },
    });
  } catch (error) {
    return {
      error: "Failed to create document.",
    };
  }

  return {
    data: {
      ...document,
      startDate: null,
      dueDate: null,
      order: 0,
      description: null,
      priority: null,
      listId: "",
      assignedUserId: null,
    },
  };
};

export const createDocument = createSafeAction(CreateDocument, handler);
