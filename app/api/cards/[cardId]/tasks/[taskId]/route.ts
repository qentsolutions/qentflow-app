import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { cardId: string; taskId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { completed } = await req.json();

    const task = await db.task.update({
      where: {
        id: params.taskId,
        cardId: params.cardId,
      },
      data: {
        completed,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { cardId: string; taskId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const task = await db.task.delete({
      where: {
        id: params.taskId,
        cardId: params.cardId,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
