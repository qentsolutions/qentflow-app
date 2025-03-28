import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { cardId: string; workspaceId: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const workspace = await db.workspace.findFirst({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
    });

    if (!workspace) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const card = await db.card.findUnique({
      where: {
        id: params.cardId,
        list: {
          board: {
            workspaceId: params.workspaceId,
          },
        },
      },
      include: {
        list: {
          select: {
            title: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        documents: {
          select: {
            id: true,
            title: true,
          },
        },
        tasks: {
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            title: true,
            completed: true,
            order: true,
          },
        },
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
