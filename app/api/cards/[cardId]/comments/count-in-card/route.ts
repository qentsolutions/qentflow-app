import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Compter le nombre de commentaires liés à la carte spécifiée
    const commentCount = await db.comment.count({
      where: {
        cardId: params.cardId,
      },
    });

    return NextResponse.json({ commentCount });
  } catch (error) {
    console.error("Error fetching comment count:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
