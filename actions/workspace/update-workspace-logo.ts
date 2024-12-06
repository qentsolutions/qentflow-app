"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache"; // Optionnel pour revalidation après action

interface UpdateLogoParams {
  workspaceId: string;
  logoUrl: string;
}

export async function updateLogoWorkspace({ workspaceId, logoUrl }: UpdateLogoParams) {
  // Récupère l'utilisateur actuel
  const user = await currentUser();
  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }

  // Vérifiez si l'utilisateur actuel est OWNER ou ADMIN du workspace
  const currentMember = await db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: user.id,
      },
    },
  });

  if (!currentMember || (currentMember.role !== "OWNER" && currentMember.role !== "ADMIN")) {
    throw new Error("You do not have permission to update the workspace logo");
  }

  // Mettez à jour le logo du workspace
  const updatedWorkspace = await db.workspace.update({
    where: { id: workspaceId },
    data: { logo: logoUrl },
  });

  // Optionnel : Revalider les données de la page pour une mise à jour immédiate
  revalidatePath(`/${workspaceId}/settings`);

  // Réponse générique
  return { message: "Logo has been updated successfully." };
}
