"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const UpdateProject = z.object({
    id: z.string(),
    workspaceId: z.string(),
    name: z.string().min(3, "Name is too short"),
    description: z.string().optional(),
    icon: z.string().optional(),
});

const handler = async (data: z.infer<typeof UpdateProject>) => {
    const user = await currentUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    const { id, workspaceId, name, description, icon } = data;

    try {
        const project = await db.project.update({
            where: {
                id,
                workspaceId,
                createdById: user.id,
            },
            data: {
                name,
                description,
                icon,
            },
        });

        revalidatePath(`/${workspaceId}/projects`);
        return { data: project };
    } catch (error) {
        return { error: "Failed to update project." };
    }
};

export const updateProject = createSafeAction(UpdateProject, handler);