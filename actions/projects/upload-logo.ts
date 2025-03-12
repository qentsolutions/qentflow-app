"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { uploadToS3 } from "@/lib/s3";

const UploadProjectLogoSchema = z.object({
  file: z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
    content: z.string(),
  }),
  projectId: z.string(),
  workspaceId: z.string(),
});

const handler = async (data: z.infer<typeof UploadProjectLogoSchema>) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { file, projectId, workspaceId } = data;

  try {
    const buffer = Buffer.from(file.content.split(",")[1], "base64");
    const key = `projects/${workspaceId}/${projectId}/${Date.now()}-${
      file.name
    }`;

    const url = await uploadToS3({
      buffer,
      key,
      contentType: file.type,
    });

    const project = await db.project.update({
      where: { id: projectId },
      data: { logo: url },
    });

    return { data: project };
  } catch (error) {
    return { error: `Failed to upload project logo. ${error}` };
  }
};

export const uploadProjectLogo = createSafeAction(
  UploadProjectLogoSchema,
  handler
);
