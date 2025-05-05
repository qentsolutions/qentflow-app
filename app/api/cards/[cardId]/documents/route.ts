// app/api/cards/[cardId]/documents/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { documentId } = await req.json();

    // Check if the document is a BoardDocument
    const boardDocument = await db.boardDocument.findUnique({
      where: { id: documentId },
    });

    if (!boardDocument) {
      return new NextResponse("Board document not found", { status: 404 });
    }

    // Get the card
    const card = await db.card.findUnique({
      where: { id: params.cardId },
      include: {
        documents: true,
      },
    });

    if (!card) {
      return new NextResponse("Card not found", { status: 404 });
    }

    // Update the card to link the document
    const updatedCard = await db.card.update({
      where: { id: params.cardId },
      data: {
        documents: {
          connect: { id: documentId },
        },
      },
      include: {
        documents: true,
      },
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error("Error linking document to card:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// GET - Retrieve documents linked to a card
export async function GET(
  req: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const card = await db.card.findUnique({
      where: { id: params.cardId },
      include: {
        documents: true,
      },
    });

    if (!card) {
      return new NextResponse("Card not found", { status: 404 });
    }

    return NextResponse.json(card.documents);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE - Remove a document link from a card
export async function DELETE(
  req: Request,
  { params }: { params: { cardId: string; documentId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedCard = await db.card.update({
      where: { id: params.cardId },
      data: {
        documents: {
          disconnect: { id: params.documentId },
        },
      },
      include: {
        documents: true,
      },
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
