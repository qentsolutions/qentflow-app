// actions/tasks/attachment/create-attachment.ts
import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { uploadToS3 } from "@/lib/s3";
import { currentUser } from "@/lib/auth";

const CreateAttachmentSchema = z.object({
  file: z.any(),
  cardId: z.string(),
  workspaceId: z.string(),
});

const handler = async (data: z.infer<typeof CreateAttachmentSchema>) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { file, cardId, workspaceId } = data;

  try {
    // Generate unique key for S3
    const key = `attachments/${workspaceId}/${cardId}/${Date.now()}-${file.name}`;
    
    // Upload to S3
    const url = await uploadToS3(file, key);

    // Create attachment record in database
    const attachment = await db.attachment.create({
      data: {
        name: file.name,
        url,
        key,
        cardId,
      },
    });

    return { data: attachment };
  } catch (error) {
    return { error: "Failed to create attachment." };
  }
};

export const createAttachment = createSafeAction(CreateAttachmentSchema, handler);
