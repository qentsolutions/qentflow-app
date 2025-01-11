import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { notificationId } = await req.json();

    // Get the notification
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return new NextResponse("Notification not found", { status: 404 });
    }

    // Find the pending invitation
    const invitation = await db.invitation.findFirst({
      where: {
        email: user.email!,
        workspaceId: params.workspaceId,
        status: "PENDING",
      },
    });

    if (!invitation) {
      return new NextResponse("Invitation not found", { status: 404 });
    }

    // Update invitation status
    await db.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    });

    // Add user to workspace
    await db.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: params.workspaceId,
        role: "USER",
      },
    });

    // Mark notification as read
    await db.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    // Create notification for workspace owner
    await db.notification.create({
      data: {
        userId: invitation.inviterId,
        workspaceId: params.workspaceId,
        message: `${user.name} has accepted your invitation to join the workspace`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
