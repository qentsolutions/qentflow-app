import { z } from "zod";
import { Card } from "@prisma/client";

import { ActionState } from "@/lib/create-safe-action";
import { UnarchiveCard } from "./schema";


export type InputType = z.infer<typeof UnarchiveCard>;
export type ReturnType = ActionState<InputType, Card>;
