import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const invitations = await db.invitation.findMany({
      where: {
        workspaceId: params.workspaceId,
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(invitations);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { email } = await req.json();

    const invitation = await db.invitation.create({
      data: {
        email,
        workspaceId: params.workspaceId,
        inviterId: user.id,
      },
    });

    // Create notification for the invited user
    const invitedUser = await db.user.findUnique({
      where: { email },
    });

    if (invitedUser) {
      await db.notification.create({
        data: {
          userId: invitedUser.id,
          workspaceId: params.workspaceId,
          message: `${user.name} has invited you to join their workspace`,
        },
      });
    }

    return NextResponse.json(invitation);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}