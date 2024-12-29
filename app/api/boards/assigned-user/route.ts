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

    // Récupérer le boardId à partir des paramètres de l'URL
    const url = new URL(request.url);
    const boardId = url.searchParams.get("boardId");

    if (!boardId) {
      return NextResponse.json(
        { error: "Board ID is required" },
        { status: 400 }
      );
    }

    // Vérification de l'existence du board et récupération des utilisateurs associés
    const board = await db.board.findUnique({
      where: { id: boardId },
      include: {
        User: true, // Inclut tous les utilisateurs associés à ce board
      },
    });

    if (!board) {
      return NextResponse.json(
        { error: "Board not found" },
        { status: 404 }
      );
    }

    // Extraire seulement le nom et l'id des utilisateurs
    const usersInBoard = board.User.map((user) => ({
      id: user.id,
      name: user.name,
      image: user.image,
    }));

    if (usersInBoard.length === 0) {
      return NextResponse.json({ error: "No users found for this board" }, { status: 404 });
    }

    return NextResponse.json(usersInBoard);
  } catch (error) {
    console.error("Error fetching users in board:", error);
    return NextResponse.json(
      { error: "Failed to fetch users in board" },
      { status: 500 }
    );
  }
}
