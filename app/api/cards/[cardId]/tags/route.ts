import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { cardId: string, workspaceId: string } }
) {
  try {
    const user = currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { tagId } = await req.json(); // Récupérer l'ID du tag à partir du corps de la requête

    if (!tagId) {
      return new NextResponse("Tag ID is required", { status: 400 });
    }

    // Mise à jour de la carte avec le tag associé
    const updatedCard = await db.card.update({
      where: {
        id: params.cardId,
        list: {
          board: {
            workspaceId: params.workspaceId,
          },
        },
      },
      data: {
        tags: {
          connect: { id: tagId },
        },
      },
    });

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
