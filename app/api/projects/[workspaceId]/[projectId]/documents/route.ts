"use client";

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

    const { documentId } = await req.json();

    // Verify the document exists and belongs to the workspace
    const document = await db.document.findFirst({
      where: {
        id: documentId,
        workspaceId: params.workspaceId,
      },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Update the document to associate it with the project
    const updatedDocument = await db.document.update({
      where: {
        id: documentId,
      },
      data: {
        projectId: params.projectId,
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("[DOCUMENT_ADD_ERROR]", error);
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

    const { documentId } = await req.json();

    // Remove the document from the project (set projectId to null)
    const updatedDocument = await db.document.update({
      where: {
        id: documentId,
        workspaceId: params.workspaceId,
      },
      data: {
        projectId: null,
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("[DOCUMENT_REMOVE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
