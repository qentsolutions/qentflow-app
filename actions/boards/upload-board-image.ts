"use server"
import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { uploadToS3, deleteFromS3 } from "@/lib/s3";  // Ajoutez une fonction pour supprimer de S3
import { currentUser } from "@/lib/auth";

const UploadBoardImageSchema = z.object({
  file: z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
    content: z.string(), // Contenu Base64
  }),
  boardId: z.string(),
  workspaceId: z.string(),
});

const handler = async (data: z.infer<typeof UploadBoardImageSchema>) => {
    const user = await currentUser();
  
    if (!user) {
      return { error: "Unauthorized" };
    }
  
    const { file, boardId, workspaceId } = data;
  
    try {
      console.log("Fetching board:", boardId);
      const board = await db.board.findUnique({
        where: { id: boardId },
      });
  
      if (board?.image) {
        console.log("Board already has an image. Deleting old image:", board.image);
        const oldImageKey = board.image.split("/").slice(-2).join("/");
        await deleteFromS3(oldImageKey); // Supprime l'ancienne image
      }
  
      console.log("Uploading new image...");
      const buffer = Buffer.from(file.content.split(",")[1], "base64");
      const key = `boards/${workspaceId}/${boardId}/${Date.now()}-${file.name}`;
      const url = await uploadToS3({
        buffer,
        key,
        contentType: file.type,
      });
  
      console.log("New image uploaded:", url);
  
      const updatedBoard = await db.board.update({
        where: { id: boardId },
        data: { image: url },
      });
  
      return { data: updatedBoard };
    } catch (error) {
      return { error: `Failed to upload board image. ${error}` };
    }
  };
  

export const uploadBoardImage = createSafeAction(
  UploadBoardImageSchema,
  handler
);
