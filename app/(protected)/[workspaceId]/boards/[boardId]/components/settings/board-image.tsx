"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { uploadBoardImage } from "@/actions/boards/upload-board-image";

// Fonction utilitaire pour lire un fichier en base64
const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === "string") {
                resolve(reader.result);
            } else {
                reject(new Error("Failed to read file as Base64 string"));
            }
        };
        reader.onerror = () => reject(new Error("File reading failed"));
        reader.readAsDataURL(file);
    });

interface UploadBoardImageProps {
    boardId: string;
    workspaceId: string;
}

export default function UploadBoardImage({ boardId, workspaceId }: UploadBoardImageProps) {
    const [isUploading, setIsUploading] = useState(false);

    // Fonction de gestion du drop de fichier
    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 0) return;

            setIsUploading(true);
            try {
                const file = acceptedFiles[0];
                const base64String = await readFileAsBase64(file);

                await uploadBoardImage({
                    file: {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        content: base64String,
                    },
                    boardId,
                    workspaceId,
                });

                toast.success("Image uploaded successfully!");
                window.location.reload();
            } catch (error) {
                console.error("Upload error:", error);
                toast.error("Failed to upload the image");
            } finally {
                setIsUploading(false);
            }
        },
        [boardId, workspaceId]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024, // Limite à 5MB
        accept: { "image/*": [] },
    });

    return (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors
        ${isDragActive ? "border-primary bg-primary/10" : ""}`}
        >
            <input {...getInputProps()} />
            {isUploading ? (
                <p>Uploading...</p>
            ) : isDragActive ? (
                <p>Drop the image here...</p>
            ) : (
                <p>Drag & drop an image here, or click to select</p>
            )}
        </div>
    );
}
