import { z } from "zod";
import { Card } from "@prisma/client";
import { ActionState } from "@/lib/create-safe-action";
import { UpdatePriority } from "./schema";
export type InputType = z.infer<typeof UpdatePriority>;
export type ReturnType = ActionState<InputType, Card>;
