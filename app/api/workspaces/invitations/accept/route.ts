import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { notificationId } = await req.json();

    // Get the notification with workspace details
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
      include: {
        workspace: true,
      },
    });

    if (!notification) {
      return new NextResponse("Notification not found", { status: 404 });
    }

    // Find the pending invitation using the workspace ID from the notification
    const invitation = await db.invitation.findFirst({
      where: {
        email: user.email!,
        workspaceId: notification.workspaceId,
        status: "PENDING",
      },
    });

    if (!invitation) {
      return new NextResponse("Invitation not found", { status: 404 });
    }

    // Start a transaction to ensure all operations succeed or fail together
    await db.$transaction(async (tx) => {
      // 1. Update invitation status
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      });

      // 2. Add user to workspace using the workspaceId from the invitation
      await tx.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: invitation.workspaceId,
          role: "USER",
        },
      });

      // 3. Mark notification as read
      await tx.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });

      // 4. Create notification for workspace owner
      await tx.notification.create({
        data: {
          userId: invitation.inviterId,
          workspaceId: invitation.workspaceId,
          message: `${user.name} has accepted your invitation to join the workspace "${notification.workspace.name}"`,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}