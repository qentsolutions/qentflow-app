import { z } from "zod";

export const CopyCard = z.object({
  id: z.string(),
  boardId: z.string(),
  workspaceId : z.string(),
});
