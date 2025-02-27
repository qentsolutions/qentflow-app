"use server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function revokeInvitation(
  workspaceId: string,
  invitationId: string
) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    if (!workspaceId || !invitationId) {
      throw new Error("Workspace ID or Invitation ID is missing");
    }

    // Vérifier si l'utilisateur a les permissions pour supprimer l'invitation
    const invitation = await db.invitation.findUnique({
      where: {
        id: invitationId,
        workspaceId,
      },
      include: {
        workspace: true,
        inviter: true,
      },
    });

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.inviterId !== user.id) {
      throw new Error("Unauthorized to delete this invitation");
    }

    // Supprimer l'invitation
    await db.invitation.delete({
      where: {
        id: invitationId,
      },
    });

    return "Invitation deleted successfully";
  } catch (error) {
    console.error("Error deleting invitation:", error);
    throw new Error("Internal Error");
  }
}
