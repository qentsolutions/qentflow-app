"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const DeleteProject = z.object({
  id: z.string(),
  workspaceId: z.string(),
});

const handler = async (data: z.infer<typeof DeleteProject>) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { id, workspaceId } = data;

  try {
    const project = await db.project.delete({
      where: {
        id,
        workspaceId,
        createdById: user.id,
      },
    });

    revalidatePath(`/${workspaceId}/projects`);
    return { data: project };
  } catch (error) {
    return { error: "Failed to delete project." };
  }
};

export const deleteProject = createSafeAction(DeleteProject, handler);