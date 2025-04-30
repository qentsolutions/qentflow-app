import { z } from "zod";

export const CreateBoardFromTemplate = z.object({
  title: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title is required",
  })
  .min(2, {
    message: "Title is too short.",
  })
  .refine(title => /^[^<>{}]+$/.test(title), {
    message: "Title must not contain special characters <, >, {, or }",
  }),
  workspaceId: z.string(),
  templateId: z.string(),
});
