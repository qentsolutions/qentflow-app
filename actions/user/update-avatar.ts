// actions/update-avatar.ts
"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { uploadToS3 } from "@/lib/s3";
import { currentUser } from "@/lib/auth";

const UpdateAvatarSchema = z.object({
  file: z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
    content: z.string(),
  }),
});

const handler = async (data: z.infer<typeof UpdateAvatarSchema>) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { file } = data;

  try {
    const buffer = Buffer.from(file.content.split(",")[1], "base64");
    const key = `avatars/${user.id}/${Date.now()}-${file.name}`;

    const url = await uploadToS3({
      buffer,
      key,
      contentType: file.type,
    });

    await db.user.update({
      where: { id: user.id },
      data: { image: url },
    });

    return { data: { url } };
  } catch (error) {
    return { error: `Failed to update avatar. ${error}` };
  }
};

export const updateAvatar = createSafeAction(UpdateAvatarSchema, handler);
