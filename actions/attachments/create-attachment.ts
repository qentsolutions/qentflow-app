// actions/attachments/create-attachment.ts
"use server"

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { uploadToS3 } from "@/lib/s3";
import { currentUser } from "@/lib/auth";

const CreateAttachmentSchema = z.object({
  file: z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
    content: z.string(),
  }),
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
    // Convertir le contenu Base64 en Buffer
    const buffer = Buffer.from(file.content.split(',')[1], 'base64');
    
    // Générer une clé unique pour S3
    const key = `attachments/${workspaceId}/${cardId}/${Date.now()}-${file.name}`;
    
    // Upload vers S3
    const url = await uploadToS3({
      buffer,
      key,
      contentType: file.type,
    });

    // Créer l'enregistrement dans la base de données
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
    return { error: `Failed to create attachment. ${error}` };
  }
};

export const createAttachment = createSafeAction(CreateAttachmentSchema, handler);
