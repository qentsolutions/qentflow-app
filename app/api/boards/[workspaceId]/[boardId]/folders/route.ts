import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { boardId } = params;

    // Check if the board exists and the user has access to it
    const board = await db.board.findFirst({
      where: {
        id: boardId,
        User: {
          some: {
            id: user.id,
          },
        },
      },
    });

    if (!board) {
      return new NextResponse("Board not found or access denied", {
        status: 404,
      });
    }

    // Get all folders for the board
    const folders = await db.boardFolder.findMany({
      where: {
        boardId,
      },
      orderBy: {
        order: "asc",
      },
      include: {
        subfolders: true,
        documents: true,
      },
    });

    return NextResponse.json(folders);
  } catch (error) {
    console.error("[BOARD_FOLDERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { boardId } = params;
    const { name, parentId } = await req.json();

    // Check if the board exists and the user has access to it
    const board = await db.board.findFirst({
      where: {
        id: boardId,
        User: {
          some: {
            id: user.id,
          },
        },
      },
    });

    if (!board) {
      return new NextResponse("Board not found or access denied", {
        status: 404,
      });
    }

    // If a parent ID is provided, check if it exists
    if (parentId) {
      const parentFolder = await db.boardFolder.findUnique({
        where: {
          id: parentId,
          boardId,
        },
      });

      if (!parentFolder) {
        return new NextResponse("Parent folder not found", { status: 404 });
      }
    }

    // Get the highest order value to place the new folder at the end
    const highestOrder = await db.boardFolder.findFirst({
      where: {
        boardId,
        parentId: parentId || null,
      },
      orderBy: {
        order: "desc",
      },
      select: {
        order: true,
      },
    });

    const newOrder = highestOrder ? highestOrder.order + 1 : 0;

    // Create the folder
    const folder = await db.boardFolder.create({
      data: {
        name,
        boardId,
        parentId: parentId || null,
        createdById: user.id,
        order: newOrder,
      },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error("[BOARD_FOLDER_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
