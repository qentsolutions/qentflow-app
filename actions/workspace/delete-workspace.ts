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

    const user = await currentUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    // Vérifie si l'utilisateur est un administrateur dans ce workspace
    const workspace = await db.workspace.findFirst({
      where: {
        id: values.workspaceId,
        members: {
          some: {
            userId: user.id,
            role: UserRole.ADMIN,
          },
        },
      },
    });

    if (!workspace) {
      return { error: "Workspace not found or unauthorized" };
    }

    // Supprime le workspace
    await db.workspace.delete({
      where: {
        id: values.workspaceId,
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
