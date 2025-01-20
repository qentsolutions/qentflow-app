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

    if (!user.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const invitations = await db.invitation.findMany({
      where: {
        email: user.email,
        status: "PENDING",
      },
      include: {
        workspace: true,
        inviter: true,
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

    return NextResponse.json(invitation);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
