import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const boardId = searchParams.get("boardId");

    const automations = await db.automation.findMany({
      where: {
        workspaceId: params.workspaceId,
        boardId: boardId || undefined,
      },
      include: {
        trigger: true,
        actions: {
          orderBy: {
            order: "asc",
          },
        },
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

    return NextResponse.json(automations);
  } catch (error) {
    console.error("[AUTOMATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description, boardId, triggerType, triggerConditions, actions } = body;

    // Vérifier que le workspace existe
    const workspace = await db.workspace.findUnique({
      where: { id: params.workspaceId },
    });

    if (!workspace) {
      return new NextResponse("Workspace not found", { status: 404 });
    }

    // Créer le trigger
    const trigger = await db.automationTrigger.create({
      data: {
        type: triggerType,
        conditions: triggerConditions || {},
      },
    });

    // Créer l'automation
    const automation = await db.automation.create({
      data: {
        name,
        description,
        workspaceId: params.workspaceId,
        boardId,
        createdById: user.id,
        triggerId: trigger.id,
        actions: {
          create: actions.map((action: any) => ({
            type: action.type,
            config: action.config,
            order: action.order,
          })),
        },
      },
      include: {
        trigger: true,
        actions: true,
      },
    });

    return NextResponse.json(automation);
  } catch (error) {
    console.error("[AUTOMATION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}