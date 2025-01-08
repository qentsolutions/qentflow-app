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
    const workspaceId = url.searchParams.get("workspaceId");
    const boardId = url.searchParams.get("boardId");

    if (!workspaceId || !boardId) {
      return NextResponse.json(
        { error: "Workspace ID and Board ID are required" },
        { status: 400 }
      );
    }

    // Vérification de l'appartenance de l'utilisateur au workspace
    const isMember = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
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

    // Récupérer les membres d'un board spécifique
    const boardMembers = await db.board.findUnique({
      where: { id: boardId },
      select: {
        User: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!boardMembers) {
      return NextResponse.json(
        { error: "Board not found" },
        { status: 404 }
      );
    }

    // Retourner les membres du board
    return NextResponse.json(boardMembers.User);
  } catch (error) {
    console.error("Error fetching board members:", error);
    return NextResponse.json(
      { error: "Failed to fetch board members" },
      { status: 500 }
    );
  }
}
