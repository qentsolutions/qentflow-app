"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const ManageTeamMembers = z.object({
  teamId: z.string(),
  workspaceId: z.string(),
  userIds: z.array(z.string()),
});

const handler = async (data: z.infer<typeof ManageTeamMembers>) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { teamId, workspaceId, userIds } = data;

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
      return { error: "Unauthorized - Only admins can manage team members" };
    }

    // Supprimer tous les membres actuels
    await db.teamMember.deleteMany({
      where: { teamId },
    });

    // Ajouter les nouveaux membres
    await db.teamMember.createMany({
      data: userIds.map((userId) => ({
        teamId,
        userId,
      })),
    });

    revalidatePath(`/${workspaceId}/settings/teams`);
    return { success: "Team members updated successfully" };
  } catch (error) {
    return { error: "Failed to update team members." };
  }
};

export const manageTeamMembers = createSafeAction(ManageTeamMembers, handler);
