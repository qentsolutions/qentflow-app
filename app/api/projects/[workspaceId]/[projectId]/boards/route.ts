import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string; projectId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { boardId } = await req.json();

    // Verify the board exists and belongs to the workspace
    const board = await db.board.findFirst({
      where: {
        id: boardId,
        workspaceId: params.workspaceId,
      },
    });

    if (!board) {
      return new NextResponse("Board not found", { status: 404 });
    }

    // Update the board to associate it with the project
    const updatedBoard = await db.board.update({
      where: {
        id: boardId,
      },
      data: {
        projectId: params.projectId,
      },
    });

    return NextResponse.json(updatedBoard);
  } catch (error) {
    console.error("[BOARD_ADD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { workspaceId: string; projectId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { boardId } = await req.json();

    // Remove the board from the project (set projectId to null)
    const updatedBoard = await db.board.update({
      where: {
        id: boardId,
        workspaceId: params.workspaceId,
      },
      data: {
        projectId: null,
      },
    });

    return NextResponse.json(updatedBoard);
  } catch (error) {
    console.error("[BOARD_REMOVE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
