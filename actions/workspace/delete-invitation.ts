"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

interface DeclineInvitationParams {
  invitationId: string;
}

export async function declineInvitation({
  invitationId,
}: DeclineInvitationParams) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Retrieve the invitation details
    const invitation = await db.invitation.findUnique({
      where: { id: invitationId },
      include: { workspace: true },
    });

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.status !== "PENDING") {
      throw new Error("This invitation is not in a valid state to be declined");
    }

    // Update invitation status to 'DECLINED'
    await db.invitation.update({
      where: { id: invitationId },
      data: { status: "DECLINED" },
    });

    // Optionally, create a notification for the inviter
    await db.notification.create({
      data: {
        userId: invitation.inviterId,
        workspaceId: invitation.workspaceId,
        message: `${user.name} has declined your invitation to join the workspace "${invitation.workspace.name}"`,
      },
    });

    return { message: "Invitation declined successfully" };
  } catch (error: any) {
    console.error("Error in declineInvitation:", error);
    throw error;
  }
}
