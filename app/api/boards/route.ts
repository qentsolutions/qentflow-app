import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "User is not authenticated" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const workspaceId = url.searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
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

    // Récupérer tous les boards et vérifier si l'utilisateur est membre
    const boards = await db.board.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      include: {
        User: {
          where: {
            id: user.id, // Vérifie si l'utilisateur est associé au board
          },
        },
      },
    });

    // Ajouter une propriété isMember pour chaque board
    const boardsWithMemberStatus = boards.map((board) => ({
      ...board,
      isMember: board.User.length > 0, // Si l'utilisateur est dans la liste des utilisateurs du board
    }));

    if (boardsWithMemberStatus.length === 0) {
      return NextResponse.json({ error: "No boards found" }, { status: 404 });
    }

    return NextResponse.json(boardsWithMemberStatus);
  } catch (error) {
    console.error("Error fetching boards:", error);
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 }
    );
  }
}
