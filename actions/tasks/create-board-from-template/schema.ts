import { z } from "zod";

export const CreateBoardFromTemplate = z.object({
  title: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title is required",
  }).min(3, {
    message: "Title is too short."
  }),
  workspaceId: z.string(),
  templateId: z.string(),
});