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

    // Get all cards for the board
    const cards = await db.card.findMany({
      where: {
        list: {
          boardId,
        },
      },
      include: {
        list: {
          select: {
            id: true,
            title: true,
            boardId: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            completed: true,
          },
        },
        tags: true,
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
        children: {
          select: {
            id: true,
            title: true,
          },
        },
        sourceRelationships: {
          include: {
            destCard: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        destinationRelationships: {
          include: {
            sourceCard: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(cards);
  } catch (error) {
    console.error("[BOARD_CARDS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
