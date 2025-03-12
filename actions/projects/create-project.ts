"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const CreateProject = z.object({
    name: z.string({
        required_error: "Name is required",
        invalid_type_error: "Name is required",
    }).min(3, {
        message: "Name is too short",
    }),
    description: z.string().optional(),
    workspaceId: z.string(),
    icon: z.string().optional(),
});

const handler = async (data: z.infer<typeof CreateProject>) => {
    const user = await currentUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    const { name, description, workspaceId, icon } = data;

    try {
        const project = await db.project.create({
            data: {
                name,
                description,
                icon,
                workspaceId,
                createdById: user.id,
            },
        });

        revalidatePath(`/${workspaceId}/projects`);
        return { data: project };
    } catch (error) {
        return { error: "Failed to create project." };
    }
};

export const createProject = createSafeAction(CreateProject, handler);