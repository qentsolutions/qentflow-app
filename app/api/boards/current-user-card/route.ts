import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return new NextResponse("Workspace ID is required", { status: 400 });
    }

    // Récupérer uniquement les cartes assignées à l'utilisateur actuel
    const assignedCards = await db.card.findMany({
      where: {
        list: {
          board: {
            workspaceId,
          },
        },
        assignedUserId: user.id, // Filtre pour ne récupérer que les cartes assignées à l'utilisateur
      },
      include: {
        list: {
          select: {
            title: true,
            board: {
              select: {
                title: true,
                workspaceId: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(assignedCards);
  } catch (error) {
    console.error("[CARDS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
