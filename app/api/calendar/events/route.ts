// app/api/calendar/events/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return new NextResponse("Workspace ID is required", { status: 400 });
    }

    const events = await db.calendarEvent.findMany({
      where: {
        workspaceId,
        userId: user.id, // Filter events by the current user
      },
      include: {
        card: {
          include: {
            list: {
              include: {
                board: true,
              },
            },
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("[CALENDAR_EVENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
