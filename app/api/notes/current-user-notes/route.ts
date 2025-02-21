// pages/api/notes/current-user-notes.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // Récupérer l'utilisateur actuellement connecté
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "User is not authenticated" },
        { status: 401 }
      );
    }

    // Récupérer le workspaceId à partir des paramètres de l'URL
    const url = new URL(request.url);
    const workspaceId = url.searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID is required" },
        { status: 400 }
      );
    }

    // Récupérer les notes de l'utilisateur pour le workspace spécifié
    const notes = await db.note.findMany({
      where: {
        createdById: user.id,
        workspaceId: workspaceId,
      },
      include: {
        createdBy: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}
