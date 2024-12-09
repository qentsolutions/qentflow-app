// actions/tasks/delete-tag/schema.ts
import { z } from "zod";

export const DeleteTag = z.object({
  id: z.string(),
  boardId: z.string(),
  workspaceId: z.string(),
});
