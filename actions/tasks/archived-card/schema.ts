import { z } from "zod";

export const ArchiveCard = z.object({
  cardId: z.string(),
  workspaceId: z.string(),
  boardId: z.string(),
});
