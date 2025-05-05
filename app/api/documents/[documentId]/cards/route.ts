import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

// GET – Récupérer un document
export async function GET(
  req: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const document = await db.document.findUnique({
      where: { id: params.documentId },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId: user.id },
            },
          },
        },
        createdBy: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    if (document.workspace.members.length === 0) {
      return new NextResponse("Unauthorized access to document", {
        status: 403,
      });
    }

    // On retire workspace avant d’envoyer
    const { workspace, ...doc } = document;
    return NextResponse.json(doc);
  } catch (error) {
    console.error("[DOCUMENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
