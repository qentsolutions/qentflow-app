"use server";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { CreateTag } from "./schema";
import { InputType, ReturnType } from "./types";
import { currentUser } from "@/lib/auth";

const handler = async (data: InputType): Promise<ReturnType> => {
  const user = await currentUser(); // Si `currentUser` est asynchrone, ajoute `await`.

  if (!user) {
    throw new Error("User not found!");
  }

  const { name, boardId, color } = data; // Ajout de `color`

  try {
    // Crée le tag dans la base de données avec la couleur
    const tag = await db.tag.create({
      data: {
        name: name,
        boardId: boardId,
        color: color || null, // Si la couleur est fournie, l'utilise, sinon laisse la valeur nulle
      },
    });

    return {
      data: {
        ...tag,
        title: "",
        order: 0,
        archived: null,
        startDate: null,
        dueDate: null,
        priority: null,
        description: null,
        listId: "",
        assignedUserId: null,
      },
    }; // Retourne le tag créé avec les propriétés manquantes
  } catch (error) {
    console.error("Error creating tag:", error);
    return {
      error: "Failed to create tag. Please try again.",
    };
  }
};

export const createTag = createSafeAction(CreateTag, handler);
