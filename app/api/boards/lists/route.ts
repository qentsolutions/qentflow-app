import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
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

    // Récupérer le board pour obtenir le workspaceId
    const board = await db.board.findUnique({
      where: { id: boardId },
      select: { workspaceId: true },
    });

    if (!board) {
      return NextResponse.json(
        { error: "Board not found" },
        { status: 404 }
      );
    }

    // Vérification de l'appartenance de l'utilisateur au workspace
    const isMember = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: board.workspaceId,
          userId: user.id,
        },
      },
    });

    if (!isMember) {
      return NextResponse.json(
        { error: "User is not a member of the workspace" },
        { status: 403 }
      );
    }

    // Récupérer toutes les listes du board
    const lists = await db.list.findMany({
      where: { boardId },
      orderBy: { order: "asc" },
    });

    if (lists.length === 0) {
      return NextResponse.json({ error: "No lists found" }, { status: 404 });
    }

    return NextResponse.json(lists);
  } catch (error) {
    console.error("Error fetching lists:", error);
    return NextResponse.json(
      { error: "Failed to fetch lists" },
      { status: 500 }
    );
  }
}
