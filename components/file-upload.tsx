// components/file-upload.tsx
"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import { createAttachment } from "@/actions/attachments/create-attachment";

interface FileUploadProps {
  cardId: string;
  workspaceId: string;
  onUploadComplete?: () => void;
}

export const FileUpload = ({ cardId, workspaceId, onUploadComplete }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const { execute } = useAction(createAttachment, {
    onSuccess: () => {
      toast.success("File uploaded successfully");
      onUploadComplete?.();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", acceptedFiles[0]);
      
      await execute({
        file: acceptedFiles[0],
        cardId,
        workspaceId,
      });
    } finally {
      setIsUploading(false);
    }
  }, [cardId, workspaceId, execute]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    }
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the file here...</p>
      ) : (
        <p>{isUploading ? "Uploading..." : "Drag & drop a file here, or click to select"}</p>
      )}
    </div>
  );
};
