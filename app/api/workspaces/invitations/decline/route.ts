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

    // Find the pending invitation
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

    // Start a transaction
    await db.$transaction(async (tx) => {
      // 1. Update invitation status
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: "DECLINED" },
      });

      // 2. Mark notification as read
      await tx.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });

      // 3. Create notification for workspace owner
      await tx.notification.create({
        data: {
          userId: invitation.inviterId,
          workspaceId: invitation.workspaceId,
          message: `${user.name} has declined your invitation to join the workspace "${notification.workspace.name}"`,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error declining invitation:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}