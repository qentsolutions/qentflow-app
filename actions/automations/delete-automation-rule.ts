"use server";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";


export const deleteAutomationRule = async (id: string) => {
  const user = await currentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const automationRule = await db.automationRule.findFirst({
    where: {
      id,
      board: {
        workspace: {
          members: {
            some: {
              userId: user.id,
            },
          },
        },
      },
    },
  });

  if (!automationRule) {
    return { error: "Automation rule not found or unauthorized" };
  }

  // Supprimer la règle d'automatisation
  await db.automationRule.delete({
    where: { id },
  });

  return { success: "Automation rule deleted successfully" };
};
