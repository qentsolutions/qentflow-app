import { currentRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  const role = await currentRole();

  // Vérifier si l'utilisateur a le rôle ADMIN
  if (role !== UserRole.ADMIN) {
    return new NextResponse(null, { status: 403 }); // Accès refusé si le rôle n'est pas ADMIN
  }

  try {
    // Si l'utilisateur est ADMIN, récupérer tous les feedbacks
    const feedbacks = await db.feedback.findMany();

    return new NextResponse(JSON.stringify(feedbacks), { status: 200 });
  } catch (error) {
    // En cas d'erreur, renvoyer une réponse avec un code 500
    return new NextResponse(null, {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
}
