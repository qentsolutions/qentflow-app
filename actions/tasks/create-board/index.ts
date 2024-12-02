"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { InputType, ReturnType } from "./types";
import { CreateBoard } from "./schema";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { currentUser } from "@/lib/auth";

const handler = async (data: InputType): Promise<ReturnType> => {
  const user = currentUser();

  if (!user) {
    throw new Error("User not found!");
  }

  const { title, workspaceId } = data;

  if (!workspaceId) {
    return {
      error: "Missing fields. Failed to create board.",
    };
  }

  try {
    // Créer le board et récupérer son id
    const board = await db.board.create({
      data: {
        title,
        workspaceId,
      },
    });

    // Vérification pour s'assurer que le board est bien créé
    if (!board || !board.id) {
      throw new Error("Failed to retrieve board ID after creation.");
    }

    // Créer automatiquement les listes associées
    const defaultLists = ["To Do", "In Progress", "Done"];
    const listsData = defaultLists.map((listTitle, index) => ({
      title: listTitle,
      order: index, // Ordre des listes
      boardId: board.id,
    }));

    await db.list.createMany({
      data: listsData,
    });

    // Ajouter un audit log pour la création du board
    await createAuditLog({
      entityTitle: board.title,
      entityId: board.id,
      entityType: ENTITY_TYPE.BOARD,
      action: ACTION.CREATE,
      workspaceId,
    });

    // Revalidation du chemin pour mettre à jour le cache
    revalidatePath(`/${workspaceId}/boards/${board.id}`);

    return { data: board };
  } catch (error) {
    console.error("Error creating board or lists:", error);
    return {
      error: "Failed to create.",
    };
  }
};

export const createBoard = createSafeAction(CreateBoard, handler);
