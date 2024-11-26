import { z } from "zod";

export const RemoveTagFromCard = z.object({
  boardId: z.string(),
  workspaceId: z.string(),
  tagId: z.string(),
  cardId: z.string(),
});
