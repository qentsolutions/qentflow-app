import { NextResponse } from "next/server";
import { ENTITY_TYPE } from "@prisma/client";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { cardId: string, workspaceId: string } }
) {
  try {
    const user = currentUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const auditLogs = await db.auditLog.findMany({
      where: {
        workspaceId: params.workspaceId,  // Utilisation de workspaceId dans les paramètres
        entityId: params.cardId,
        entityType: ENTITY_TYPE.CARD,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(auditLogs);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
