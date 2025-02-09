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

    const { searchParams } = new URL(req.url);
    const boardId = searchParams.get("boardId");

    const automations = await db.automation.findMany({
      where: {
        workspaceId: params.workspaceId,
        boardId: boardId || undefined,
      },
      include: {
        trigger: true,
        actions: {
          orderBy: {
            order: "asc",
          },
        },
        createdBy: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(automations);
  } catch (error) {
    console.error("[AUTOMATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
