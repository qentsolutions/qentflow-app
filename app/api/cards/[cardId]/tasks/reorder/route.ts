import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { tasks } = await req.json();

    // Update all tasks in a transaction
    await db.$transaction(
      tasks.map((task: any) =>
        db.task.update({
          where: {
            id: task.id,
            cardId: params.cardId,
          },
          data: {
            order: task.order,
          },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
