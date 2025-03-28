"use client";
// NotePage.tsx
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, AlertTriangle } from "lucide-react";
import { NoteEditor } from "../components/NoteEditor";
import { editNote } from "@/actions/notes/edit-note";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";

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
    workspaceId: string;
}

const NotePage = ({ params, readonly, onDelete }: any) => {
    const { noteId, workspaceId } = params;
    const [note, setNote] = useState<Note | null>(null);
    const queryClient = useQueryClient();
    const { currentWorkspace } = useCurrentWorkspace();

    const { data, isLoading } = useQuery({
        queryKey: ["note", noteId],
        queryFn: () => fetch(`/api/notes/${noteId}?workspaceId=${workspaceId}`).then(res => res.json()),
        enabled: !!noteId && !!workspaceId,
    });

    const handleUpdateNote = async (values: { title: string; content?: string }) => {
        const result = await editNote(noteId, {
            ...values,
            workspaceId,
        });

        queryClient.invalidateQueries({ queryKey: ["user-notes", currentWorkspace?.id] });

        if (result.error) {
            throw new Error(result.error);
        }

        return result;
    };

    useEffect(() => {
        if (data) {
            setNote(data);
        }
    }, [data]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <Calendar className="h-20 w-20 mx-auto text-gray-300 mb-6 animate-pulse" />
                    <h2 className="text-3xl font-semibold text-gray-600">Loading note...</h2>
                </div>
            </div>
        );
    }

    if (!note) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="h-20 w-20 mx-auto text-red-500 mb-6" />
                    <h2 className="text-3xl font-semibold text-red-600">Note not found</h2>
                </div>
            </div>
        );
    }

    return <NoteEditor note={note} onSave={handleUpdateNote} readonly={readonly} onDelete={onDelete} />;
}

export default NotePage;
