import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string; projectId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const project = await db.project.findUnique({
      where: {
        id: params.projectId,
        workspaceId: params.workspaceId,
      },
      include: {
        boards: true,
        documents: true,
        // Ajoutez ici d'autres relations à inclure
      },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { workspaceId: string; projectId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const project = await db.project.delete({
      where: {
        id: params.projectId,
        workspaceId: params.workspaceId,
        createdById: user.id,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { workspaceId: string; projectId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description, icon } = body;

    const project = await db.project.update({
      where: {
        id: params.projectId,
        workspaceId: params.workspaceId,
        createdById: user.id,
      },
      data: {
        name,
        description,
        icon,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
