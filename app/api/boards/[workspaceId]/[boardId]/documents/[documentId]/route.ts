import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { boardId: string; documentId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { boardId, documentId } = params;

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

    // Get the document
    const document = await db.boardDocument.findUnique({
      where: {
        id: documentId,
        boardId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("[BOARD_DOCUMENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { boardId: string; documentId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { boardId, documentId } = params;
    const { title, content } = await req.json();

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

    // Update the document
    const updatedDocument = await db.boardDocument.update({
      where: {
        id: documentId,
        boardId,
      },
      data: {
        title,
        content,
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("[BOARD_DOCUMENT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { boardId: string; documentId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { boardId, documentId } = params;

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

    // Delete the document
    await db.boardDocument.delete({
      where: {
        id: documentId,
        boardId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[BOARD_DOCUMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}