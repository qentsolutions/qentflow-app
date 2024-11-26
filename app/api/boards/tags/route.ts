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
    const boardId = url.searchParams.get("boardId");

    // Validation de workspaceId
    if (!boardId) {
      return NextResponse.json(
        { error: "board ID is required" },
        { status: 400 }
      );
    }

    // Requête à la base de données pour récupérer les boards
    const tags = await db.tag.findMany({
      where: { boardId },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching boards:", error);
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 }
    );
  }
}
