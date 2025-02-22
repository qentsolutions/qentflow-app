"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { deleteNote } from "@/actions/notes/delete-note";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";

interface Note {
    workspaceId: string;
    id: string;
    title: string;
    content?: string;
    createdAt: string;
    updatedAt: string;
    tags?: any[];
    createdBy: {
        name: string;
    };
    priority?: string;
}

interface NoteEditorProps {
    note: Note;
    onSave: (note: { title: string; content?: string }) => Promise<any>;
    readonly?: boolean;
    onDelete: () => void;
}

const SAVE_DEBOUNCE_TIME = 1000;

export function NoteEditor({ note, onSave, readonly = false, onDelete }: NoteEditorProps) {
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content || "");
    const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
    const previousValueRef = useRef({ title: note.title, content: note.content || "" });
    const debouncedTitle = useDebounce(title, SAVE_DEBOUNCE_TIME);
    const debouncedContent = useDebounce(content, SAVE_DEBOUNCE_TIME);
    const queryClient = useQueryClient();
    const { currentWorkspace } = useCurrentWorkspace();

    useEffect(() => {
        if (readonly) return;
        const hasChanged =
            debouncedTitle !== previousValueRef.current.title ||
            debouncedContent !== previousValueRef.current.content;
        if (!hasChanged) return;

        const saveNote = async () => {
            try {
                setSaveStatus("saving");
                await onSave({ title: debouncedTitle, content: debouncedContent });
                setSaveStatus("saved");
                previousValueRef.current = { title: debouncedTitle, content: debouncedContent };
            } catch (error) {
                setSaveStatus("error");
                toast.error("Failed to save changes");
            }
        };

        saveNote();
    }, [debouncedTitle, debouncedContent, readonly, onSave]);

    const handleDelete = async () => {
        const result = await deleteNote({ id: note.id, workspaceId: note.workspaceId });
        queryClient.invalidateQueries({ queryKey: ["user-notes", currentWorkspace?.id] });
        if (result.success) {
            toast.success("Note deleted successfully");
            onDelete();
        } else {
            toast.error(result.error || "Failed to delete note");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full flex bg-gray-100 p-2"
        >
            <Card className="w-full bg-white shadow-none rounded-none relative">
                <CardContent className="p-6">
                    <div className="absolute top-2 right-2 flex items-center gap-2">
                        {!readonly && (
                            <>
                                <Badge
                                    variant={saveStatus === "error" ? "destructive" : "secondary"}
                                    className="animate-fade-in"
                                >
                                    {saveStatus === "saving" && "Saving..."}
                                    {saveStatus === "saved" && "Saved"}
                                    {saveStatus === "error" && "Error saving"}
                                </Badge>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="focus:outline-none">
                                            <MoreVertical className="h-4 w-4 text-gray-500" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={handleDelete}>
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-2xl font-bold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                            placeholder="Note title"
                            readOnly={readonly}
                        />
                    </div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full min-h-[75vh] text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0 resize-none"
                        placeholder="Start writing your note..."
                        readOnly={readonly}
                    />
                </CardContent>
            </Card>
        </motion.div>
    );
}
