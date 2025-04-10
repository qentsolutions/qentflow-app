import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { boardId: string; workspaceId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { boardId, workspaceId } = params;

    // Check if the board exists and the user has access to it
    const board = await db.board.findFirst({
      where: {
        id: boardId,
        workspaceId,
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

    // Get all documents and folders for the board
    const documents = await db.boardDocument.findMany({
      where: {
        boardId,
      },
      orderBy: {
        order: "asc",
      },
    });

    const folders = await db.boardFolder.findMany({
      where: {
        boardId,
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json({ documents, folders });
  } catch (error) {
    console.error("[BOARD_DOCUMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { boardId: string; workspaceId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { boardId, workspaceId } = params;
    const { title, content, folderId } = await req.json();

    // Check if the board exists and the user has access to it
    const board = await db.board.findFirst({
      where: {
        id: boardId,
        workspaceId,
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

    // If a folder ID is provided, check if it exists
    if (folderId) {
      const folder = await db.boardFolder.findUnique({
        where: {
          id: folderId,
          boardId,
        },
      });

      if (!folder) {
        return new NextResponse("Folder not found", { status: 404 });
      }
    }

    // Get the highest order value to place the new document at the end
    const highestOrder = await db.boardDocument.findFirst({
      where: {
        boardId,
        folderId: folderId || null,
      },
      orderBy: {
        order: "desc",
      },
      select: {
        order: true,
      },
    });

    const newOrder = highestOrder ? highestOrder.order + 1 : 0;

    // Create the document
    const document = await db.boardDocument.create({
      data: {
        title,
        content: content || "",
        boardId,
        folderId: folderId || null,
        createdById: user.id,
        order: newOrder,
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("[BOARD_DOCUMENT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}