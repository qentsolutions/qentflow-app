import { NextResponse } from "next/server";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);

    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorized" ,{ status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (!params.memberId) {
      return new NextResponse("Member ID missing", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        userId: profile.id,
      },
      data: {
        workspaceMembers: {
          deleteMany: {
            id: params.memberId,
            userId: {
              not: profile.id
            }
          }
        }
      },
      include: {
        workspaceMembers: {
          include: {
            user: true,
          },
          orderBy: {
            role: "asc",
          }
        },
      },
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[MEMBER_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const profile = await currentProfile();
    const { searchParams } = new URL(req.url);
    const { role } = await req.json();

    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID missing", { status: 400 });
    }

    if (!params.memberId) {
      return new NextResponse("Member ID missing", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        userId: profile.id,
      },
      data: {
        workspaceMembers: {
          update: {
            where: {
              id: params.memberId,
              userId: {
                not: profile.id
              }
            },
            data: {
              role
            }
          }
        }
      },
      include: {
        workspaceMembers: {
          include: {
            user: true,
          },
          orderBy: {
            role: "asc"
          }
        }
      }
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[MEMBERS_ID_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}