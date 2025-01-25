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

    // Récupérer le nombre de cartes assignées à l'utilisateur actuel
    const assignedCardsCount = await db.card.count({
      where: {
        list: {
          board: {
            workspaceId,
          },
        },
        assignedUserId: user.id,
      },
    });

    return NextResponse.json(assignedCardsCount);
  } catch (error) {
    console.error("[CARDS_COUNT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
