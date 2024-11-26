import { z } from "zod";
import { Card } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { AddTagToCard } from "./schema";

export type InputType = z.infer<typeof AddTagToCard>;
export type ReturnType = ActionState<InputType, Card>;
