import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const user = currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Rechercher les commentaires liés à une carte spécifique
    const comments = await db.comment.findMany({
      where: {
        cardId: params.cardId,
      },
      orderBy: {
        createdAt: "desc", // Trier les commentaires du plus récent au plus ancien
      },
      include: {
        user: {
          // Inclure les informations sur l'utilisateur qui a posté le commentaire
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
