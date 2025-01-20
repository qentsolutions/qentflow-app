"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

interface InviteMemberParams {
  workspaceId: string;
  email: string;
}

export async function inviteMember({ workspaceId, email }: InviteMemberParams) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // Check if user is already a member
    const existingMember = await db.workspaceMember.findFirst({
      where: {
        workspace: { id: workspaceId },
        user: { email },
      },
    });

    if (existingMember) {
      throw new Error("User is already a member of this workspace");
    }

    // Check if there's already a pending invitation
    const existingInvitation = await db.invitation.findFirst({
      where: {
        email,
        workspaceId,
        status: "PENDING",
      },
    });

    if (existingInvitation) {
      throw new Error("An invitation is already pending for this email");
    }

    // Get workspace details
    const workspace = await db.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // Create invitation
    const invitation = await db.invitation.create({
      data: {
        email,
        workspaceId,
        inviterId: user.id,
      },
    });

    // Find invited user
    const invitedUser = await db.user.findUnique({
      where: { email },
    });

    // If user exists, create notification
    if (invitedUser) {
      await db.notification.create({
        data: {
          userId: invitedUser.id,
          workspaceId,
          message: `${user.name} has invited you to join the workspace "${workspace.name}"`,
          isInvitation: true,
        },
      });
    }

    return { message: "Invitation sent successfully" };
  } catch (error: any) {
    console.error("Error in inviteMember:", error);
    throw error;
  }
}