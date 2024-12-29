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

    const card = await db.card.update({
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

    return NextResponse.json(card);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
