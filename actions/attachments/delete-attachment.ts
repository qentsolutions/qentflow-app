"use server";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { deleteFromS3 } from "@/lib/s3";

interface DeleteAttachmentData {
  id: string;
  key: string;
}

export const deleteAttachment = async (data: DeleteAttachmentData) => {
  const user = await currentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  await deleteFromS3(data.key);
  
  const attachment = await db.attachment.delete({
    where: {
      id: data.id,
    },
  });

  return attachment;
};