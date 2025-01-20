import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      // Vérification que l'utilisateur est authentifié et possède un ID
      return NextResponse.json(
        { error: "User is not authenticated or user ID is missing" },
        { status: 401 }
      );
    }

    if (!user.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Récupérer uniquement les invitations avec le statut "PENDING"
    const invitations = await db.invitation.findMany({
      where: {
        email: user.email, // Filtrer par l'email de l'utilisateur actuel
        status: "PENDING", // Filtrer uniquement les invitations PENDING
      },
      include: {
        workspace: true, // Inclure les détails du workspace
      },
      orderBy: {
        createdAt: "desc", // Trier les invitations par date de création (descendant)
      },
    });

    // Retourner les invitations avec leurs informations et celles du workspace
    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}
