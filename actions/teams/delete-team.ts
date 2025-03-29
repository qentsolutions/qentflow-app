"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const DeleteTeam = z.object({
  teamId: z.string(),
  workspaceId: z.string(),
});

const handler = async (data: z.infer<typeof DeleteTeam>) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { teamId, workspaceId } = data;

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
      return { error: "Unauthorized - Only admins can delete teams" };
    }

    // Vérifier si c'est l'équipe par défaut
    const team = await db.team.findUnique({
      where: { id: teamId },
    });

    if (team?.isDefault) {
      return { error: "Cannot delete default team" };
    }

    await db.team.delete({
      where: { id: teamId },
    });

    revalidatePath(`/${workspaceId}/settings/teams`);
    return { success: "Team deleted successfully" };
  } catch (error) {
    return { error: "Failed to delete team." };
  }
};

export const deleteTeam = createSafeAction(DeleteTeam, handler);
