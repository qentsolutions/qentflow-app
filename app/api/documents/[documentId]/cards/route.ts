import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

// GET - Récupérer les cartes liées à un document
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
        cards: {
          include: {
            list: {
              include: {
                board: true,
              },
            },
          },
        },
      },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    return NextResponse.json(document.cards);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST - Lier une carte à un document
export async function POST(
  req: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { cardId } = await req.json();

    const updatedDocument = await db.document.update({
      where: { id: params.documentId },
      data: {
        cards: {
          connect: { id: cardId },
        },
      },
      include: {
        cards: true,
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { documentId: string; cardId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedDocument = await db.document.update({
      where: { id: params.documentId },
      data: {
        cards: {
          disconnect: { id: params.cardId },
        },
      },
      include: {
        cards: true,
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}