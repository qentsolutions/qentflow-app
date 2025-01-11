import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const tasks = await db.task.findMany({
      where: {
        cardId: params.cardId,
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { cardId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, order } = await req.json();

    const task = await db.task.create({
      data: {
        title,
        order,
        cardId: params.cardId,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}