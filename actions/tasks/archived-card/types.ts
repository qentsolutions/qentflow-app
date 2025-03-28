import { z } from "zod";
import { Card } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";

import { ArchiveCard } from "./schema";

export type InputType = z.infer<typeof ArchiveCard>;
export type ReturnType = ActionState<InputType, Card>;
