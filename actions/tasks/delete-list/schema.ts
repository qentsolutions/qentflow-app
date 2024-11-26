import { z } from "zod";

export const DeleteList = z.object({
  id: z.string(),
  boardId: z.string(),
  workspaceId : z.string(),
});
