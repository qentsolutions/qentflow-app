import { ACTION, ENTITY_TYPE } from "@prisma/client";

import { db } from "@/lib/db";
import { currentUser } from "./auth";
import { useSession } from "next-auth/react";

interface Props {
  entityId: string;
  entityType: ENTITY_TYPE;
  entityTitle: string;
  action: ACTION;
  workspaceId: string;
  userId?: string;
}

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export const createAuditLog = async (props: Props) => {
  try {
    // Use currentUser function to get the user using the type User
    const user = await currentUser();
    // Use only currentUser to get name, image and id
    const userName = user?.name ?? "Unknown User Name";
    const userImage = user?.image ?? "Unknow User Image";
    const userId = user?.id ?? "Unknow User Id";

    if (!user || !user.id) {
      throw new Error("User not authenticated!");
    }

    const { entityId, entityType, entityTitle, action, workspaceId } = props;

    await db.auditLog.create({
      data: {
        workspaceId,
        entityId,
        entityType,
        entityTitle,
        action,
        userId: userId || "",
        userImage: userImage || "",
        userName: userName || "",
      },
    });
  } catch (error) {
    console.log("[AUDIT_LOG_ERROR]", error);
  }
};
