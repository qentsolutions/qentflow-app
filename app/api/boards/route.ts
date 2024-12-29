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

    // Récupérer tous les boards et le créateur ainsi que le nombre de membres
    const boards = await db.board.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      include: {
        User: true, // Inclut tous les utilisateurs pour chaque board
      },
    });

    // Ajouter le créateur (name, id, imageUrl), le nombre de membres et la date de création pour chaque board
    const boardsWithCreatorAndMemberCount = boards.map((board) => {
      const creator = board.User.find((user) => user.id === board.createdById); // Trouver le créateur
      const isMember = board.User.some((boardUser) => boardUser.id === user.id); // Comparer avec l'utilisateur actuel
      return {
        id: board.id,
        title: board.title,
        createdAt: board.createdAt,
        creator: {
          name: creator?.name,
          imageUrl: creator?.image || null, // URL de l'image du créateur
        },
        memberCount: board.User.length,
        isMember, // Ajouter l'information sur l'adhésion
      };
    });

    if (boardsWithCreatorAndMemberCount.length === 0) {
      return NextResponse.json({ error: "No boards found" }, { status: 404 });
    }

    return NextResponse.json(boardsWithCreatorAndMemberCount);
  } catch (error) {
    console.error("Error fetching boards:", error);
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 }
    );
  }
}
