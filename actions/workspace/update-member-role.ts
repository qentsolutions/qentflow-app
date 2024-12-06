"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client"; // Assurez-vous que les rôles sont définis ici comme `USER`, `ADMIN`, et `OWNER`
import { z } from "zod";

const UpdateRoleSchema = z.object({
  workspaceId: z.string().min(1, "Workspace ID is required"),
  memberId: z.string().min(1, "Member ID is required"),
  newRole: z.enum(["USER", "ADMIN", "OWNER"]),
});

export async function updateMemberRole(values: z.infer<typeof UpdateRoleSchema>) {
  const validatedFields = UpdateRoleSchema.safeParse(values);

  if (!validatedFields.success) {
    throw new Error("Invalid data");
  }

  const { workspaceId, memberId, newRole } = validatedFields.data;

  // Récupère l'utilisateur actuel
  const user = await currentUser();
  if (!user || !user.id) {
    throw new Error("Unauthorized");
  }

  // Récupérer les informations du membre actuel
  const currentMember = await db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: user.id,
      },
    },
  });

  if (!currentMember) {
    throw new Error("You are not a member of this workspace");
  }

  // Vérifier si le membre cible existe dans le workspace
  const targetMember = await db.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: memberId,
      },
    },
  });

  if (!targetMember) {
    throw new Error("Target member not found in this workspace");
  }

  // Si l'utilisateur est OWNER
  if (currentMember.role === "OWNER") {
    // Le OWNER peut modifier le rôle du membre cible en USER ou ADMIN
    if (newRole !== "USER" && newRole !== "ADMIN") {
      throw new Error("Invalid role");
    }

    await db.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: memberId,
        },
      },
      data: {
        role: newRole,
      },
    });

    return { success: "Role updated successfully" };
  }

  // Si l'utilisateur est ADMIN
  if (currentMember.role === "ADMIN") {
    // Un ADMIN ne peut changer que son propre rôle en USER
    if (memberId !== user.id) {
      throw new Error("You are not allowed to change other members' roles");
    }

    if (newRole !== "USER") {
      throw new Error("Invalid role change");
    }

    await db.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id,
        },
      },
      data: {
        role: "USER",
      },
    });

    return { success: "You have been demoted to USER" };
  }

  // Si l'utilisateur n'est ni OWNER ni ADMIN
  throw new Error("You do not have permission to change roles");
}
