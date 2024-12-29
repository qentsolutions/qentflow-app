import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "User is not authenticated or user id is missing" },
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

    // Récupérer tous les boards du workspace auxquels l'utilisateur appartient
    const boards = await db.board.findMany({
      where: {
        workspaceId,
        User: {
          some: {
            id: user.id,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        lists: {
          orderBy: {
            order: "asc",
          },
          include: {
            cards: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
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
