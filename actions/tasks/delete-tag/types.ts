// actions/tasks/delete-tag/types.ts
import { z } from "zod";
import { Tag } from "@prisma/client";
import { ActionState } from "@/lib/create-safe-action";
import { DeleteTag } from "./schema";

export type InputType = z.infer<typeof DeleteTag>;
export type ReturnType = ActionState<InputType, Tag>;
