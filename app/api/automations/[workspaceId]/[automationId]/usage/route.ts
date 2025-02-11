import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { startOfDay, endOfDay, subDays } from "date-fns";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string; boardId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get total executions
    const totalExecutions = await db.automationActivity.count({
      where: {
        boardId: params.boardId,
        automationId: params.boardId,
        workspaceId: params.workspaceId,
      },
    });

    // Get success rate
    const successfulExecutions = await db.automationActivity.count({
      where: {
        boardId: params.boardId,
        automationId: params.boardId,
        workspaceId: params.workspaceId,
        status: "success",
      },
    });

    const successRate =
      totalExecutions > 0
        ? Math.round((successfulExecutions / totalExecutions) * 100)
        : 0;

    // Get daily usage for the last 30 days
    const thirtyDaysAgo = subDays(new Date(), 30);
    const dailyUsage = await db.automationActivity.groupBy({
      by: ["createdAt"],
      where: {
        boardId: params.boardId,
        workspaceId: params.workspaceId,
        createdAt: {
          gte: startOfDay(thirtyDaysAgo),
          lte: endOfDay(new Date()),
        },
      },
      _count: true,
    });

    // Get most used automation type
    const automationTypes = await db.automationActivity.groupBy({
      by: ["type"],
      where: {
        boardId: params.boardId,
        workspaceId: params.workspaceId,
      },
      _count: true,
    });

    const formattedTypes = automationTypes.map((type) => ({
      type: type.type,
      count: type._count,
    }));

    return NextResponse.json({
      totalExecutions,
      successRate,
      dailyUsage: dailyUsage.map((day) => ({
        date: day.createdAt,
        count: day._count,
      })),
      automationTypes: formattedTypes,
    });
  } catch (error) {
    console.error("[AUTOMATION_USAGE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
