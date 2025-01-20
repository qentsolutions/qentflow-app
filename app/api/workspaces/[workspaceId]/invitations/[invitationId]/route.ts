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
    }

    return NextResponse.json(invitation);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}