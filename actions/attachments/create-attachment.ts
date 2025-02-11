"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { uploadToS3 } from "@/lib/s3";
import { currentUser } from "@/lib/auth";
import { automationEngine } from "@/lib/automation-engine";

const CreateAttachmentSchema = z.object({
  file: z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
    content: z.string(),
  }),
  cardId: z.string(),
  workspaceId: z.string(),
  boardId: z.string(),
});

const handler = async (data: z.infer<typeof CreateAttachmentSchema>) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { file, cardId, workspaceId, boardId } = data;

  try {
    const buffer = Buffer.from(file.content.split(",")[1], "base64");
    const key = `attachments/${workspaceId}/${cardId}/${Date.now()}-${
      file.name
    }`;

    const url = await uploadToS3({
      buffer,
      key,
      contentType: file.type,
    });

    const attachment = await db.attachment.create({
      data: {
        name: file.name,
        url,
        key,
        cardId,
      },
    });

    // Trigger automation for attachment added
    await automationEngine.processAutomations(
      "ATTACHMENT_ADDED",
      {
        cardId,
        attachmentId: attachment.id,
        attachmentName: file.name,
        attachmentUrl: url,
      },
      workspaceId,
      boardId
    );

    return { data: attachment };
  } catch (error) {
    return { error: `Failed to create attachment. ${error}` };
  }
};

export const createAttachment = createSafeAction(
  CreateAttachmentSchema,
  handler
);
