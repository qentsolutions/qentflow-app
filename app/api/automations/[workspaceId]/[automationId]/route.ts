import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string; automationId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const automation = await db.automation.findUnique({
      where: {
        id: params.automationId,
        workspaceId: params.workspaceId,
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
    });

    return NextResponse.json(automation);
  } catch (error) {
    console.error("[AUTOMATION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { workspaceId: string; automationId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const automation = await db.automation.delete({
      where: {
        id: params.automationId,
        workspaceId: params.workspaceId,
      },
    });

    return NextResponse.json(automation);
  } catch (error) {
    console.error("[AUTOMATION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// app/api/automations/[workspaceId]/[automationId]/route.ts

export async function PATCH(
  req: Request,
  { params }: { params: { workspaceId: string; automationId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { active } = body;

    const automation = await db.automation.update({
      where: {
        id: params.automationId,
        workspaceId: params.workspaceId,
      },
      data: {
        active,
      },
    });

    return NextResponse.json(automation);
  } catch (error) {
    console.error("[AUTOMATION_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
