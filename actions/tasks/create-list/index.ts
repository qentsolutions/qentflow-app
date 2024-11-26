"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { CreateList } from "./schema";
import { InputType, ReturnType } from "./types";
import { currentUser } from "@/lib/auth";

const handler = async (data: InputType): Promise<ReturnType> => {
  const user = await currentUser();

  if (!user || !user.id) {
    throw new Error("User not authenticated!");
  }

  const { title, boardId, workspaceId } = data;

  try {
    const isMember = await db.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: user?.id,
      },
    });

    if (!isMember) {
      return {
        error: "User is not a member of the specified workspace",
      };
    }

    // Vérification que le board appartient bien au workspace
    const board = await db.board.findUnique({
      where: {
        id: boardId,
        workspaceId,
      },
    });

    if (!board) {
      return {
        error: "Board not found in the specified workspace",
      };
    }

    // Trouver l'ordre de la dernière liste
    const lastList = await db.list.findFirst({
      where: { boardId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const newOrder = lastList ? lastList.order + 1 : 1;

    // Création de la nouvelle liste
    const list = await db.list.create({
      data: {
        title,
        boardId,
        order: newOrder,
      },
    });


    // Revalidation du chemin pour mettre à jour la page concernée
    revalidatePath(`/workspace/${workspaceId}board/${boardId}`);

    return { data: list };
  } catch (error) {
    console.error("Error in createList handler:", error);
    return {
      error: "Failed to create.",
    };
  }
};

export const createList = createSafeAction(CreateList, handler);
