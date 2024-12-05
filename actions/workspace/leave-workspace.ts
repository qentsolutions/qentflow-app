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

  // Si l'utilisateur est un admin et que c'est le seul admin, vous pouvez ajouter une logique pour ne pas le laisser partir
  if (currentMember.role === "ADMIN") {
    const adminCount = await db.workspaceMember.count({
      where: {
        workspaceId,
        role: "ADMIN",
      },
    });

    // Si c'est le seul admin, vous pouvez empêcher l'utilisateur de quitter ou demander de transférer l'admin
    if (adminCount === 1) {
      throw new Error("You cannot leave the workspace as the only admin. Please transfer admin rights first.");
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
  revalidatePath(`/workspace/${workspaceId}`);

  return { message: "You have successfully left the workspace" };
}
