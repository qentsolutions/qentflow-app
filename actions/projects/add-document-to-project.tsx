"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const AddDocumentToProjectSchema = z.object({
  documentId: z.string(),
  projectId: z.string(),
  workspaceId: z.string(),
});

const handler = async (data: z.infer<typeof AddDocumentToProjectSchema>) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { documentId, projectId, workspaceId } = data;

  try {
    // Verify the document exists and belongs to the workspace
    const document = await db.document.findFirst({
      where: {
        id: documentId,
        workspaceId,
      },
    });

    if (!document) {
      return { error: "Document not found" };
    }

    // Update the document to associate it with the project
    const updatedDocument = await db.document.update({
      where: {
        id: documentId,
      },
      data: {
        projectId,
      },
    });

    revalidatePath(`/${workspaceId}/projects/${projectId}`);
    return { data: updatedDocument };
  } catch (error) {
    return { error: "Failed to add document to project." };
  }
};

export const addDocumentToProject = createSafeAction(AddDocumentToProjectSchema, handler);