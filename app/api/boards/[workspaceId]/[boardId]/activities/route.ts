import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string; boardId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const activities = await db.automationActivity.findMany({
      where: {
        boardId: params.boardId,
      },
      include: {
        automation: true,
        workspace: true,
        board: true,
      },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("[AUTOMATION_ACTIVITIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
