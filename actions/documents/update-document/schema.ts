import { z } from "zod";

export const UpdateDocument = z.object({
  id: z.string(),
  title: z.string().optional(),
  content: z.string().optional(),
  workspaceId: z.string(),
});
