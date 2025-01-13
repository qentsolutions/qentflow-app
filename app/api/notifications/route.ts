import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      // Vérification que l'utilisateur est authentifié et a un ID
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

    // Vérification si l'utilisateur est membre du workspace
    const isMember = await db.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
    });

    // Récupérer toutes les notifications pour l'utilisateur dans le workspace spécifié
    const notifications = await db.notification.findMany({
      where: {
        userId: user.id, // Filtrer par userId pour l'utilisateur actuel
      },
      orderBy: {
        createdAt: "desc", // Trier par date de création (descendant)
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
