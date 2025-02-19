// components/file-upload.tsx
"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import { useQueryClient } from "@tanstack/react-query";
import { updateAvatar } from "@/actions/user/update-avatar";

interface FileUploadProps {
  onUploadComplete?: () => void;
}

export const FileUpload = ({ onUploadComplete }: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const { execute } = useAction(updateAvatar, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["current-user"],
      });
      toast.success("Avatar uploaded successfully");
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
      const file = acceptedFiles[0];

      // Convertir le fichier en objet simple
      const fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        // Convertir le fichier en ArrayBuffer puis en Base64
        content: await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              reject(new Error("Failed to read file as Base64 string"));
            }
          };
          reader.onerror = () => reject(new Error("File reading failed"));
          reader.readAsDataURL(file);
        }),
      };

      await execute({ file: fileData });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  }, [execute]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    accept: {
      'image/*': [],
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors
        ${isDragActive ? 'border-primary bg-primary/10' : ''}`}
    >
      <input {...getInputProps()} />
      {isUploading ? (
        <p>Uploading...</p>
      ) : isDragActive ? (
        <p>Drop the file here...</p>
      ) : (
        <p>Drag & drop a file here, or click to select</p>
      )}
    </div>
  );
};
