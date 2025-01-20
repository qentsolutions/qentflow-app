import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const project = await db.project.findUnique({
      where: {
        id: params.projectId,
      },
      include: {
        features: {
          include: {
            // Inclure les détails des entités liées
            board: {
              select: {
                id: true,
                title: true,
                lists: {
                  include: {
                    cards: true
                  }
                }
              }
            },
            document: {
              select: {
                id: true,
                title: true,
                content: true
              }
            }
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    // Vérifier si l'utilisateur a accès au projet
    const canAccess = 
      project.createdById === user.id || // Créateur du projet
      project.visibility === "public" || // Projet public
      project.members.some(member => member.userId === user.id); // Membre du projet

    if (!canAccess) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
