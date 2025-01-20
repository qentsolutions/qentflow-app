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

    const { type } = await req.json();

    // Vérifier l'accès au projet
    const project = await db.project.findFirst({
      where: {
        id: params.projectId,
        OR: [
          { createdById: user.id },
          {
            members: {
              some: {
                userId: user.id
              }
            }
          }
        ]
      }
    });

    if (!project) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Créer l'entité spécifique (board ou document) d'abord
    let entityId;
    if (type === "boards") {
      const board = await db.board.create({
        data: {
          title: "New Board",
          workspaceId: project.workspaceId,
          createdById: user.id,
          User: {
            connect: { id: user.id }
          }
        }
      });
      entityId = board.id;
    } else if (type === "documents") {
      const document = await db.document.create({
        data: {
          title: "New Document",
          workspaceId: project.workspaceId,
          createdById: user.id,
          users: {
            connect: { id: user.id }
          }
        }
      });
      entityId = document.id;
    }

    // Créer la feature avec l'ID de l'entité créée
    const feature = await db.feature.create({
      data: {
        type,
        entityId: entityId!,
        projectId: params.projectId,
      },
    });

    return NextResponse.json(feature);
  } catch (error) {
    console.error("[FEATURE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}