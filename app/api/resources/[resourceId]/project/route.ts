import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { resourceId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First try to find the resource as a board
    const board = await db.board.findUnique({
      where: { id: params.resourceId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (board?.project) {
      return NextResponse.json(board.project);
    }

    // If not found as a board, try as a document
    const document = await db.document.findUnique({
      where: { id: params.resourceId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (document?.project) {
      return NextResponse.json(document.project);
    }

    return new NextResponse("No project found", { status: 404 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
