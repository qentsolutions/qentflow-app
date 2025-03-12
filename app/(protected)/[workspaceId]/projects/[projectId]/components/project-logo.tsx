"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import { uploadProjectLogo } from "@/actions/projects/upload-logo";

interface ProjectLogoUploadProps {
    projectId: string;
    workspaceId: string;
    onUploadComplete?: () => void;
}

export const ProjectLogoUpload = ({ projectId, workspaceId, onUploadComplete }: ProjectLogoUploadProps) => {
    const [isUploading, setIsUploading] = useState(false);

    const { execute } = useAction(uploadProjectLogo, {
        onSuccess: () => {
            toast.success("Project logo uploaded successfully");
            onUploadComplete?.();
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 0) return;

            setIsUploading(true);
            try {
                const file = acceptedFiles[0];
                const fileData = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    content: await new Promise<string>((resolve, reject) => {
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
                    }),
                };

                await execute({
                    file: fileData,
                    projectId,
                    workspaceId,
                });
            } catch (error) {
                console.error("Upload error:", error);
                toast.error("Failed to upload logo");
            } finally {
                setIsUploading(false);
            }
        },
        [execute, projectId, workspaceId]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024, // 5MB
        accept: {
            "image/*": [],
        },
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
                <p>Drop the logo here...</p>
            ) : (
                <p>Drag & drop a logo here, or click to select</p>
            )}
        </div>
    );
};