"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { z } from "zod";

const DeleteWorkspaceSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
});

export const deleteWorkspace = async (values: z.infer<typeof DeleteWorkspaceSchema>) => {
  try {
    const validatedFields = DeleteWorkspaceSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid workspace ID!" };
    }

    const { workspaceId } = validatedFields.data;

    const user = await currentUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    // Vérifie si l'utilisateur est le OWNER du workspace
    const workspace = await db.workspace.findFirst({
      where: {
        id: workspaceId,
        members: {
          some: {
            userId: user.id,
            role: UserRole.OWNER,
          },
        },
      },
    });

    if (!workspace) {
      return { error: "Workspace not found or unauthorized" };
    }

    // Compte le nombre de membres dans le workspace
    const memberCount = await db.workspaceMember.count({
      where: {
        workspaceId,
      },
    });

    if (memberCount > 1) {
      return {
        error: "You cannot delete the workspace while other members are present.",
      };
    }

    // Supprime le workspace
    await db.workspace.delete({
      where: {
        id: workspaceId,
      },
    });

    return { success: "Workspace deleted!" };
  } catch (error) {
    const isProduction = process.env.NODE_ENV === "production";

    return {
      error:
        error instanceof Error
          ? !isProduction
            ? "An unexpected error occurred. Please try again later."
            : error.message
          : "Something went wrong!",
    };
  }
};
