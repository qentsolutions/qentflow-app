import { z } from "zod";
import { Card } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { RemoveTagFromCard } from "./schema";

export type InputType = z.infer<typeof RemoveTagFromCard>;
export type ReturnType = ActionState<InputType, Card>;
