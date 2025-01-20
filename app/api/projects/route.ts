import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name, description, workspaceId, features } = await req.json();

    // Créer le projet
    const project = await db.project.create({
      data: {
        name,
        description,
        workspaceId,
        createdById: user.id,
      },
    });

    // Ajouter les features sélectionnées
    if (features && features.length > 0) {
      await db.feature.createMany({
        data: features.map((feature: any) => ({
          type: feature.type,
          entityId: feature.entityId,
          projectId: project.id,
        })),
      });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return new NextResponse("Workspace ID is required", { status: 400 });
    }

    const projects = await db.project.findMany({
      where: {
        workspaceId,
      },
      include: {
        features: true,
        createdBy: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("[PROJECTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}