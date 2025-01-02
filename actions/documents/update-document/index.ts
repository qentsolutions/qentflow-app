"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { createSafeAction } from "@/lib/create-safe-action";
import { UpdateDocument } from "./schema";
import { InputType, ReturnType } from "./types";

const handler = async (data: InputType): Promise<ReturnType> => {
  const user = await currentUser();

  if (!user) {
    return {
      error: "Unauthorized",
    };
  }

  const { id, title, content, workspaceId } = data;

  let document;

  try {
    document = await db.document.update({
      where: {
        id,
        workspaceId,
      },
      data: {
        ...(title && { title }),
        ...(content && { content }),
      },
    });
  } catch (error) {
    return {
      error: "Failed to update document.",
    };
  }

  return { 
    data: {
      ...document,
      order: 0,
      priority: null,
      description: null,
      listId: "",
      assignedUserId: null
    }
  };
};

export const updateDocument = createSafeAction(UpdateDocument, handler);