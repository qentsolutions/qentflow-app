"use server"
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

  // Vérifie si l'utilisateur actuel est un membre autorisé (OWNER ou ADMIN)
  const currentMember = await db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: user.id,
      },
    },
  });

  if (!currentMember || !["OWNER", "ADMIN"].includes(currentMember.role)) {
    throw new Error("You do not have permission to invite members");
  }

  // Vérifie si l'utilisateur à inviter existe déjà dans la base de données
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    // Vérifie si l'utilisateur est déjà membre du workspace
    const existingMember = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: existingUser.id,
      },
    });

    if (existingMember) {
      throw new Error("This user is already a member of the workspace");
    }

    // Ajoute l'utilisateur en tant que membre du workspace
    await db.workspaceMember.create({
      data: {
        workspaceId,
        userId: existingUser.id,
        role: "USER", // Les utilisateurs invités auront le rôle "USER"
      },
    });

    // Ajouter l'utilisateur aux workspaceMembers du serveur associé
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
      include: { servers: true }, // Inclure les serveurs du workspace
    });

    if (!workspace || workspace.servers.length === 0) {
      throw new Error("No servers found for this workspace");
    }

    // On suppose ici que le serveur "General" existe déjà pour ce workspace
    const server = workspace.servers.find(
      (server) => server.name === "General"
    );

    if (!server) {
      throw new Error("General server not found for this workspace");
    }

    // Ajoute l'utilisateur au modèle workspaceMembers du serveur "General"
    await db.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: existingUser.id,
        },
      },
      data: {
        Server: {
          connect: {
            id: server.id,
          },
        },
      },
    });
  } else {
    // Logique pour gérer l'invitation d'un nouvel utilisateur
    // Exemple : envoyer un email d'invitation ou créer un compte temporaire
    throw new Error(
      "User does not exist. Please invite registered users only."
    );
  }

  // Optionnel : Revalider les données de la page pour une mise à jour immédiate
  revalidatePath(`/${workspaceId}/settings`);

  return { message: "Invitation has been sent." };
}
