import { z } from "zod";

export const UnarchiveCard = z.object({
  cardId: z.string(),
  workspaceId: z.string(),
  boardId: z.string(),
});
