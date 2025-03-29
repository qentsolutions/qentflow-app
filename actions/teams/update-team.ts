"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const UpdateTeam = z.object({
  teamId: z.string(),
  workspaceId: z.string(),
  name: z.string().min(1, "Team name is required"),
  description: z.string().optional(),
});

const handler = async (data: z.infer<typeof UpdateTeam>) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { teamId, workspaceId, name, description } = data;

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
      return { error: "Unauthorized - Only admins can update teams" };
    }

    const team = await db.team.update({
      where: { id: teamId },
      data: { name, description },
    });

    revalidatePath(`/${workspaceId}/settings/teams`);
    return { data: team };
  } catch (error) {
    return { error: "Failed to update team." };
  }
};

export const updateTeam = createSafeAction(UpdateTeam, handler);
