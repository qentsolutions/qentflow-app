"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache"; // Optionnel pour revalidation après action

interface LeaveWorkspaceParams {
  workspaceId: string;
}

export async function leaveWorkspace({ workspaceId }: LeaveWorkspaceParams) {
  // Récupère l'utilisateur actuel
  const user = await currentUser();
  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }

  // Vérifiez si l'utilisateur est membre du workspace
  const currentMember = await db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: user.id,
      },
    },
  });

  if (!currentMember) {
    throw new Error("You are not a member of this workspace");
  }

  // Vérifiez si l'utilisateur est OWNER
  if (currentMember.role === "OWNER") {
    const memberCount = await db.workspaceMember.count({
      where: { workspaceId },
    });

    // Empêcher le OWNER de quitter si d'autres membres sont encore présents
    if (memberCount > 1) {
      throw new Error(
        "You cannot leave the workspace as the owner while other members are still part of it. Please transfer ownership or remove other members first."
      );
    }
  }

  // Supprimez l'utilisateur du workspace
  await db.workspaceMember.delete({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: user.id,
      },
    },
  });

  // Optionnel : Revalider les données de la page pour une mise à jour immédiate
  revalidatePath(`/${workspaceId}/settings`);

  return { message: "You have successfully left the workspace" };
}
