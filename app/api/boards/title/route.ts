import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      // Vérification que user et user.id sont définis
      return NextResponse.json(
        { error: "User is not authenticated or user ID is missing" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const boardId = url.searchParams.get("boardId");

    if (!boardId) {
      return NextResponse.json(
        { error: "Board ID is required" },
        { status: 400 }
      );
    }

    // Vérification de l'appartenance de l'utilisateur au board
    const isMember = await db.board.findFirst({
      where: {
        id: boardId,
        User: {
          some: {
            id: user.id,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!isMember) {
      return NextResponse.json(
        { error: "User is not a member of the board" },
        { status: 403 }
      );
    }

    // Récupérer le titre du board
    const board = await db.board.findUnique({
      where: { id: boardId },
      select: { title: true },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    return NextResponse.json({ title: board.title });
  } catch (error) {
    console.error("Error fetching board title:", error);
    return NextResponse.json(
      { error: "Failed to fetch board title" },
      { status: 500 }
    );
  }
}
