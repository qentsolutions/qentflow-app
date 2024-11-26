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

  const { name, boardId } = data;

  try {
    // Crée le tag dans la base de données
    const tag = await db.tag.create({
      data: {
        name: name,
        boardId: boardId,
      },
    });

    return { 
      data: {
        ...tag,
        title: "",
        order: 0,
        description: null,
        listId: ""
      }
    }; // Retourne le tag créé avec les propriétés manquantes
  } catch (error) {
    console.error("Error creating tag:", error);
    return {
      error: "Failed to create tag. Please try again.",
    };
  }
};

export const createTag = createSafeAction(CreateTag, handler);
