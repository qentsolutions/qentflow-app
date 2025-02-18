import { z } from "zod";

export const CreateBoardFromTemplate = z.object({
  title: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title is required",
  })
  .min(3, {
    message: "Title is too short.",
  })
  .refine(title => /^[a-zA-Z0-9\s]+$/.test(title), {
    message: "Title must not contain special characters",
  }),
  workspaceId: z.string(),
  templateId: z.string(),
});
