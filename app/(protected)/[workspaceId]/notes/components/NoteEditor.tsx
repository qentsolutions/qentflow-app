import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Flag, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

interface Note {
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
}

const SAVE_DEBOUNCE_TIME = 1000;

export function NoteEditor({ note, onSave, readonly = false }: NoteEditorProps) {
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content || "");
    const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");

    const debouncedTitle = useDebounce(title, SAVE_DEBOUNCE_TIME);
    const debouncedContent = useDebounce(content, SAVE_DEBOUNCE_TIME);

    useEffect(() => {
        if (readonly) return;

        const saveNote = async () => {
            try {
                setSaveStatus("saving");
                await onSave({ title: debouncedTitle, content: debouncedContent });
                setSaveStatus("saved");
            } catch (error) {
                setSaveStatus("error");
                toast.error("Failed to save changes");
            }
        };

        saveNote();
    }, [debouncedTitle, debouncedContent, readonly, onSave]);

    const getPriorityIcon = (priority: string | null) => {
        switch (priority) {
            case "LOW":
                return <Flag className="h-4 w-4 text-green-500" />;
            case "MEDIUM":
                return <Flag className="h-4 w-4 text-yellow-500" />;
            case "HIGH":
                return <Flag className="h-4 w-4 text-red-500" />;
            case "CRITICAL":
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            default:
                return null;
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
                            <Badge
                                variant={saveStatus === "error" ? "destructive" : "secondary"}
                                className="animate-fade-in"
                            >
                                {saveStatus === "saving" && "Saving..."}
                                {saveStatus === "saved" && "Saved"}
                                {saveStatus === "error" && "Error saving"}
                            </Badge>
                        )}
                    </div>

                    <div className="flex justify-between items-center mb-4">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-2xl font-bold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                            placeholder="Note title"
                        />
                    </div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full min-h-[300px] text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0 resize-none"
                        placeholder="Start writing your note..."
                    />
                </CardContent>
            </Card>
        </motion.div>
    );
}
