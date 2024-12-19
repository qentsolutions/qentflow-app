import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First check if the document exists
    const document = await db.document.findUnique({
      where: {
        id: params.documentId,
      },
      include: {
        workspace: {
          include: {
            members: {
              where: {
                userId: user.id,
              },
            },
          },
        },
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

    // Check if user has access to the workspace
    if (document.workspace.members.length === 0) {
      return new NextResponse("Unauthorized access to document", { status: 403 });
    }

    // Remove workspace data from response
    const { workspace, ...documentWithoutWorkspace } = document;
    
    return NextResponse.json(documentWithoutWorkspace);
  } catch (error) {
    console.error("[DOCUMENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { title, content } = body;

    // Check document exists and user has access
    const document = await db.document.findUnique({
      where: {
        id: params.documentId,
      },
      include: {
        workspace: {
          include: {
            members: {
              where: {
                userId: user.id,
              },
            },
          },
        },
      },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    if (document.workspace.members.length === 0) {
      return new NextResponse("Unauthorized access to document", { status: 403 });
    }

    // Update the document
    const updatedDocument = await db.document.update({
      where: {
        id: params.documentId,
      },
      data: {
        ...(title && { title }),
        ...(content && { content }),
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("[DOCUMENT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}