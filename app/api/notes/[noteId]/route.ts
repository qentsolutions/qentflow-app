// pages/api/notes/[noteId].ts
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

    // Récupérer le noteId et le workspaceId à partir des paramètres de l'URL
    const url = new URL(request.url);
    const noteId = url.pathname.split("/").pop();
    const workspaceId = url.searchParams.get("workspaceId");

    if (!noteId || !workspaceId) {
      return NextResponse.json(
        { error: "Note ID and Workspace ID are required" },
        { status: 400 }
      );
    }

    // Récupérer la note spécifiée
    const note = await db.note.findUnique({
      where: {
        id: noteId,
        workspaceId: workspaceId,
      },
      include: {
        createdBy: true,
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 }
    );
  }
}
