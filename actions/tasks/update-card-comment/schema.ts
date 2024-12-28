import { z } from "zod";

export const UpdateComment = z.object({
  commentId: z.string({
    required_error: "Comment ID is required",
    invalid_type_error: "Comment ID must be a string",
  }),
  workspaceId: z.string({
    required_error: "Workspace ID is required",
    invalid_type_error: "Workspace ID must be a string",
  }),
  boardId: z.string({
    required_error: "Board ID is required",
    invalid_type_error: "Board ID must be a string",
  }),
  userId: z.string({
    required_error: "User ID is required",
    invalid_type_error: "User ID must be a string",
  }),
  text: z.string()
});
