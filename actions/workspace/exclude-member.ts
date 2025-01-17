"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { z } from "zod";

const ExcludeMemberSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
  memberId: z.string().min(1, "Member ID is required"),
});

export const excludeMember = async (
  data: z.infer<typeof ExcludeMemberSchema>
) => {
  const validated = ExcludeMemberSchema.safeParse(data);

  if (!validated.success) {
    return { error: "Invalid data" };
  }

  const { workspaceId, memberId } = validated.data;

  const user = await currentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Récupérer le rôle de l'utilisateur qui demande l'exclusion
  const currentUserRole = await db.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: user.id,
    },
  });

  if (!currentUserRole) {
    return { error: "You are not a member of this workspace" };
  }

  // Récupérer les informations sur le membre à exclure
  const memberToExclude = await db.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: memberId,
    },
  });

  if (!memberToExclude) {
    return { error: "Member not found in this workspace" };
  }

  // Logique d'exclusion
  if (currentUserRole.role === "USER") {
    return { error: "You are not authorized to perform this action" }; // Un USER ne peut exclure personne
  }

  if (currentUserRole.role === "ADMIN") {
    if (memberToExclude.role === "OWNER") {
      return { error: "You cannot exclude the owner of the workspace" };
    }

    if (memberToExclude.role === "ADMIN") {
      return { error: "You cannot exclude another admin" };
    }
  }

  // Un OWNER peut exclure tout le monde
  // Suppression du membre
  await db.workspaceMember.delete({
    where: {
      id: memberToExclude.id,
    },
  });

  return { success: "Member successfully removed" };
};
