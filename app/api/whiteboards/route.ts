import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, workspaceId } = await req.json();

    const whiteboard = await db.whiteboard.create({
      data: {
        title,
        workspaceId,
        createdById: user.id,
        elements: [],
      },
    });

    return NextResponse.json(whiteboard);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

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

    const whiteboards = await db.whiteboard.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(whiteboards);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}