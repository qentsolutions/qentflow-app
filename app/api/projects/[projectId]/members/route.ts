import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { email } = await req.json();

    // Vérifier si l'utilisateur actuel a les droits d'inviter
    const project = await db.project.findFirst({
      where: {
        id: params.projectId,
        OR: [
          { createdById: user.id },
          {
            members: {
              some: {
                userId: user.id,
                role: "ADMIN"
              }
            }
          }
        ]
      }
    });

    if (!project) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Trouver l'utilisateur à inviter
    const userToInvite = await db.user.findUnique({
      where: { email }
    });

    if (!userToInvite) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Vérifier si l'utilisateur est déjà membre
    const existingMember = await db.projectMember.findFirst({
      where: {
        projectId: params.projectId,
        userId: userToInvite.id
      }
    });

    if (existingMember) {
      return new NextResponse("User is already a member", { status: 400 });
    }

    // Créer le membre du projet
    const member = await db.projectMember.create({
      data: {
        projectId: params.projectId,
        userId: userToInvite.id,
        role: "USER"
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    // Créer une notification pour l'utilisateur invité
    await db.notification.create({
      data: {
        userId: userToInvite.id,
        workspaceId: project.workspaceId,
        message: `You have been invited to join the project "${project.name}"`,
      }
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("[PROJECT_MEMBER_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
