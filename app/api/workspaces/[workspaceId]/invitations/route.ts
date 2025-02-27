import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

// Fonction pour récupérer les invitations d'un workspace
export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { workspaceId } = params;

    if (!workspaceId) {
      return new NextResponse("Workspace ID is missing", { status: 400 });
    }

    // Récupérer toutes les invitations pour le workspace spécifié
    const invitations = await db.invitation.findMany({
      where: {
        workspaceId,
        status: "PENDING",
      },
      include: {
        workspace: true,
        inviter: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });


    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Fonction pour créer une nouvelle invitation
export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { email } = await req.json();

    const invitation = await db.invitation.create({
      data: {
        email,
        workspaceId: params.workspaceId,
        inviterId: user.id,
      },
    });

    return NextResponse.json(invitation);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Fonction pour supprimer une invitation
export async function DELETE(
  req: Request,
  { params }: { params: { workspaceId: string; invitationId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { workspaceId, invitationId } = params;

    if (!workspaceId || !invitationId) {
      return new NextResponse("Workspace ID or Invitation ID is missing", { status: 400 });
    }

    // Vérifier si l'utilisateur a les permissions pour supprimer l'invitation
    const invitation = await db.invitation.findUnique({
      where: {
        id: invitationId,
        workspaceId,
      },
      include: {
        workspace: true,
        inviter: true,
      },
    });

    if (!invitation) {
      return new NextResponse("Invitation not found", { status: 404 });
    }

    if (invitation.inviterId !== user.id) {
      return new NextResponse("Unauthorized to delete this invitation", { status: 403 });
    }

    // Supprimer l'invitation
    await db.invitation.delete({
      where: {
        id: invitationId,
      },
    });

    return new NextResponse("Invitation deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Error deleting invitation:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
