"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";

const WorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be at most 50 characters long")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Name can only contain letters, numbers, spaces, dashes, and underscores"
    )
    .refine(
      (name) => !["use server", "use strict"].includes(name.toLowerCase()),
      "Invalid name"
    ),
});

const UpdateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(1, "Workspace name is required")
    .max(50, "Workspace name must be at most 50 characters long")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Workspace name can only contain letters, numbers, spaces, dashes, and underscores"
    )
    .refine(
      (name) => !["use server", "use strict"].includes(name.toLowerCase()),
      "Invalid workspace name"
    ),
  workspaceId: z.string().min(1, "Workspace ID is required"),
  logo: z.string().optional(),
});

export const updateWorkspace = async (
  values: z.infer<typeof UpdateWorkspaceSchema>
) => {
  try {
    const validatedFields = UpdateWorkspaceSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    const user = await currentUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    // Verify user has permission to update this workspace
    const workspace = await db.workspace.findFirst({
      where: {
        id: values.workspaceId,
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

    const updatedWorkspace = await db.workspace.update({
      where: {
        id: values.workspaceId,
      },
      data: {
        name: values.name,
      },
    });

    return { success: "Workspace updated!", workspace: updatedWorkspace };
  } catch (error) {
    return { error: "Something went wrong!" };
  }
};

export const createWorkspace = async (
  values: z.infer<typeof WorkspaceSchema>
) => {
  try {
    const validatedFields = WorkspaceSchema.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    const user = await currentUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    // Création du workspace avec un serveur par défaut
    const workspace = await db.workspace.create({
      data: {
        name: values.name,
        createdById: user.id,
        members: {
          create: {
            userId: user.id,
            role: UserRole.OWNER,
          },
        },
      },
    });

    // Création du serveur "General" après la création du workspace
   
    return { workspaceId: workspace.id };
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

export const getUserWorkspaces = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return { error: "Unauthorized" };
    }

    const workspaces = await db.workspace.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        logo: true,
        members: {
          select: {
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return {
      workspaces: workspaces.map((workspace) => ({
        ...workspace,
        createdAt: workspace.createdAt.toISOString(),
      })),
    };
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
