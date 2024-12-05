"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache"; // Optionnel pour revalidation après action

interface InviteMemberParams {
  workspaceId: string;
  email: string;
}

export async function inviteMember({ workspaceId, email }: InviteMemberParams) {
  // Récupère l'utilisateur actuel
  const user = await currentUser();
  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }

  // Vérifiez si l'utilisateur actuel est un admin du workspace
  const currentMember = await db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: user.id,
      },
    },
  });

  if (!currentMember || currentMember.role !== "ADMIN") {
    throw new Error("You do not have permission to invite members");
  }

  // Vérifiez si l'utilisateur existe dans la base de données
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  // Ne pas révéler si l'utilisateur existe ou non pour des raisons de sécurité
  if (existingUser) {
    // Vérifiez si l'utilisateur est déjà membre du workspace
    const existingMember = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: existingUser.id,
      },
    });

    if (existingMember) {
      throw new Error("This user is already a member of the workspace");
    }

    // Ajoutez l'utilisateur en tant que membre du workspace
    await db.workspaceMember.create({
      data: {
        workspaceId,
        userId: existingUser.id,
        role: "USER", // L'utilisateur invité aura le rôle "USER"
      },
    });
  }

  // Optionnel : Revalider les données de la page pour une mise à jour immédiate
  revalidatePath(`/workspace/${workspaceId}`);

  // Réponse générique qui ne révèle rien sur l'existence de l'utilisateur
  return { message: "Invitation has been sent." };
}
