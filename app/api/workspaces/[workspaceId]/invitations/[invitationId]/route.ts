import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { workspaceId: string; invitationId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { status } = await req.json();

    const invitation = await db.invitation.update({
      where: {
        id: params.invitationId,
        workspaceId: params.workspaceId,
      },
      data: { status },
    });

    if (status === "ACCEPTED") {
      // Add user to workspace
      await db.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId: params.workspaceId,
          role: "USER",
        },
      });

      // Create notification for workspace owner
      await db.notification.create({
        data: {
          userId: invitation.inviterId,
          workspaceId: params.workspaceId,
          message: `${user.name} has accepted your invitation to join the workspace`,
        },
      });
    }

    return NextResponse.json(invitation);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { workspaceId: string; invitationId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const invitation = await db.invitation.delete({
      where: {
        id: params.invitationId,
        workspaceId: params.workspaceId,
      },
    });

    return NextResponse.json(invitation);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}