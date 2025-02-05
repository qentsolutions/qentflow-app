import { z } from "zod";

export const UpdatePriority = z.object({
  id: z.string(),
  priority: z.enum(["low", "medium", "high", "critical"]).nullable(),
  boardId: z.string(),
  workspaceId: z.string(),
});
