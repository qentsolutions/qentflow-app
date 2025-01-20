"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { CreateBoardFromTemplate } from "./schema";
import { InputType, ReturnType } from "./types";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { currentUser } from "@/lib/auth";
import { boardTemplates } from "@/constants/board-templates";

const handler = async (data: InputType): Promise<ReturnType> => {
  const user = await currentUser();

  if (!user) {
    throw new Error("User not found!");
  }

  const { title, workspaceId, templateId } = data;

  if (!workspaceId) {
    return {
      error: "Missing fields. Failed to create board.",
    };
  }

  try {
    // Get template configuration
    const template = boardTemplates.find(t => t.id === templateId);
    if (!template) {
      return { error: "Template not found" };
    }

    // Create the board
    const board = await db.board.create({
      data: {
        title,
        workspaceId,
        createdById: user.id,
        User: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    // Create lists from template
    if (template.lists) {
      await Promise.all(
        template.lists.map(async (list, index) => {
          const createdList = await db.list.create({
            data: {
              title: list.title,
              boardId: board.id,
              order: index,
            },
          });

          // Create cards for this list if they exist in template
          if (list.cards) {
            await Promise.all(
              list.cards.map(async (card, cardIndex) => {
                await db.card.create({
                  data: {
                    title: card.title,
                    description: card.description,
                    listId: createdList.id,
                    order: cardIndex,
                  },
                });
              })
            );
          }
        })
      );
    }

    // Create tags from template
    if (template.tags) {
      await Promise.all(
        template.tags.map(async (tag) => {
          await db.tag.create({
            data: {
              name: tag.name,
              color: tag.color,
              boardId: board.id,
            },
          });
        })
      );
    }

    await createAuditLog({
      entityTitle: board.title,
      entityId: board.id,
      entityType: ENTITY_TYPE.BOARD,
      action: ACTION.CREATE,
      workspaceId,
    });

    revalidatePath(`/${workspaceId}/boards/${board.id}`);
    return { data: board };
  } catch (error) {
    console.error("Error creating board from template:", error);
    return {
      error: "Failed to create board from template.",
    };
  }
};

export const createBoardFromTemplate = createSafeAction(CreateBoardFromTemplate, handler);