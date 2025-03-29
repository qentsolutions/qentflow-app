"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const CreateTeam = z.object({
  name: z.string().min(1, "Team name is required"),
  description: z.string().optional(),
  workspaceId: z.string(),
});

const handler = async (data: z.infer<typeof CreateTeam>) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { name, description, workspaceId } = data;

  try {
    // Vérifier si l'utilisateur est ADMIN ou OWNER du workspace
    const member = await db.workspaceMember.findFirst({
      where: {
        userId: user.id,
        workspaceId,
        role: {
          in: ["ADMIN", "OWNER"],
        },
      },
    });

    if (!member) {
      return { error: "Unauthorized - Only admins can create teams" };
    }

    const team = await db.team.create({
      data: {
        name,
        description,
        workspaceId,
      },
    });

    revalidatePath(`/${workspaceId}/settings/teams`);
    return { data: team };
  } catch (error) {
    return { error: "Failed to create team." };
  }
};

export const createTeam = createSafeAction(CreateTeam, handler);
