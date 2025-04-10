import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { boardId: string; folderId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { boardId, folderId } = params;

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
      return new NextResponse("Board not found or access denied", { status: 404 });
    }

    // Get the folder
    const folder = await db.boardFolder.findUnique({
      where: {
        id: folderId,
        boardId,
      },
      include: {
        subfolders: true,
        documents: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!folder) {
      return new NextResponse("Folder not found", { status: 404 });
    }

    return NextResponse.json(folder);
  } catch (error) {
    console.error("[BOARD_FOLDER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { boardId: string; folderId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { boardId, folderId } = params;
    const { name, parentId, order } = await req.json();

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
      return new NextResponse("Board not found or access denied", { status: 404 });
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

      // Prevent circular references
      if (parentId === folderId) {
        return new NextResponse("A folder cannot be its own parent", { status: 400 });
      }
    }

    // Update the folder
    const updatedFolder = await db.boardFolder.update({
      where: {
        id: folderId,
        boardId,
      },
      data: {
        name: name !== undefined ? name : undefined,
        parentId: parentId !== undefined ? parentId : undefined,
        order: order !== undefined ? order : undefined,
      },
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error("[BOARD_FOLDER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { boardId: string; folderId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { boardId, folderId } = params;

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
      return new NextResponse("Board not found or access denied", { status: 404 });
    }

    // Delete the folder and all its contents (documents and subfolders)
    await db.boardFolder.delete({
      where: {
        id: folderId,
        boardId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[BOARD_FOLDER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}