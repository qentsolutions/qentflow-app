import { z } from "zod";

export const AddTagToCard = z.object({
  boardId: z.string(),
  workspaceId : z.string(),
  tagId : z.string(),
  cardId : z.string(),
});
