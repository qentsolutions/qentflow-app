import { z } from "zod";
import { Board } from "@prisma/client";
import { ActionState } from "@/lib/create-safe-action";
import { CreateBoardFromTemplate } from "./schema";

export type InputType = z.infer<typeof CreateBoardFromTemplate>;
export type ReturnType = ActionState<InputType, Board>;
