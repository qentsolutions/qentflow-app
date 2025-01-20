"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

interface AcceptInvitationParams {
  invitationId: string;
}

export async function acceptInvitation({ invitationId }: AcceptInvitationParams) {
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
      throw new Error("This invitation is not in a valid state to be accepted");
    }

    // Check if the user has already accepted the invitation or is already a member
    const existingMember = await db.workspaceMember.findFirst({
      where: {
        workspaceId: invitation.workspaceId,
        userId: user.id,
      },
    });

    if (existingMember) {
      throw new Error("You are already a member of this workspace");
    }

    // Update invitation status to 'ACCEPTED'
    await db.invitation.update({
      where: { id: invitationId },
      data: { status: "ACCEPTED" },
    });

    // Add the user to the workspace
    await db.workspaceMember.create({
      data: {
        workspaceId: invitation.workspaceId,
        userId: user.id,
      },
    });

    // Optionally, create a notification for the inviter
    await db.notification.create({
      data: {
        userId: invitation.inviterId,
        workspaceId: invitation.workspaceId,
        message: `${user.name} has accepted your invitation to join the workspace "${invitation.workspace.name}"`,
      },
    });

    return { message: "Invitation accepted successfully" };
  } catch (error: any) {
    console.error("Error in acceptInvitation:", error);
    throw error;
  }
}
