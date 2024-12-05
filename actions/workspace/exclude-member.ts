"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { z } from "zod";

const ExcludeMemberSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
  memberId: z.string().min(1, "Member ID is required"),
});

export const excludeMember = async (data: z.infer<typeof ExcludeMemberSchema>) => {
  const validated = ExcludeMemberSchema.safeParse(data);

  if (!validated.success) {
    return { error: "Invalid data" };
  }

  const { workspaceId, memberId } = validated.data;
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const isAdmin = await db.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: user.id,
      role: "ADMIN",
    },
  });

  if (!isAdmin) {
    return { error: "You are not authorized to perform this action" };
  }

  const member = await db.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: memberId,
    },
  });

  if (!member) {
    return { error: "Member not found in this workspace" };
  }

  await db.workspaceMember.delete({
    where: {
      id: member.id,
    },
  });

  return { success: "Member successfully removed" };
};
