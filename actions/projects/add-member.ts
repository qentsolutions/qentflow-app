"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

const AddProjectMemberSchema = z.object({
  projectId: z.string(),
  userId: z.string(),
  workspaceId: z.string(),
});

const handler = async (data: z.infer<typeof AddProjectMemberSchema>) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { projectId, userId, workspaceId } = data;

  try {
    // Check if the current user is the project creator
    const project = await db.project.findFirst({
      where: {
        id: projectId,
        createdById: user.id,
      },
    });

    if (!project) {
      return { error: "Not authorized to add members to this project" };
    }

    // Check if the user to be added is a member of the workspace
    const workspaceMember = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });

    if (!workspaceMember) {
      return { error: "User is not a member of the workspace" };
    }

    // Add the user to the project
    const updatedProject = await db.project.update({
      where: { id: projectId },
      data: {
        members: {
          connect: { id: userId },
        },
      },
      include: {
        members: true,
      },
    });

    return { data: updatedProject };
  } catch (error) {
    return { error: "Failed to add member to project" };
  }
};

export const addProjectMember = createSafeAction(
  AddProjectMemberSchema,
  handler
);
