"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function createNotification(userId: string, workspaceId: string, message: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Vérifier si l'utilisateur destinataire existe
  const recipientUser = await db.user.findUnique({
    where: { id: userId },
  });
  if (!recipientUser) {
    throw new Error("User not found");
  }

  // Vérifier si le workspace existe
  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
  });
  if (!workspace) {
    throw new Error("Workspace not found");
  }

  // Créer la notification
  const notification = await db.notification.create({
    data: {
      userId: userId,      // Utilisateur destinataire
      workspaceId: workspaceId, // Workspace associé
      message: message,     // Contenu du message
      createdAt: new Date(),   // Date de création
      read: false,            // Notification non lue par défaut
    },
  });

  return { message: "Notification created successfully", notification };
}
