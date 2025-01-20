import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { whiteboardId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const whiteboard = await db.whiteboard.findUnique({
      where: {
        id: params.whiteboardId,
      },
    });

    return NextResponse.json(whiteboard);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { whiteboardId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { elements, workspaceId } = await req.json();

    const whiteboard = await db.whiteboard.update({
      where: {
        id: params.whiteboardId,
        workspaceId,
      },
      data: {
        elements,
      },
    });

    return NextResponse.json(whiteboard);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}