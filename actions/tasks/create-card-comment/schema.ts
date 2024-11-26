import { z } from "zod";

export const CreateComment = z.object({
  text: z
    .string({
      required_error: "Text is required",
      invalid_type_error: "Text is required",
    })
    .min(1, {
      message: "Comment text cannot be empty",
    }),
  cardId: z.string(),
  workspaceId: z.string(),
  boardId: z.string(),
  userId : z.string()
});
