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

    // Récupérer les query parameters
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get("workspaceId");

    // Validation de workspaceId
    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 }
      );
    }

    // Vérification de l'appartenance au workspace
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
        { error: "Error" },
        { status: 403 }
      );
    }

    // Requête à la base de données pour récupérer les boards
    const boards = await db.board.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });

    if (boards.length === 0) {
      return NextResponse.json({ error: "No boards found" }, { status: 404 });
    }

    return NextResponse.json(boards);
  } catch (error) {
    console.error("Error fetching boards:", error);
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 }
    );
  }
}
