"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, AlertTriangle } from "lucide-react";
import { NoteEditor } from "../components/NoteEditor";
import { editNote } from "@/actions/notes/edit-note";

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

const NotePage = ({ params, readonly }: { params: { noteId: string; workspaceId: string }; readonly: boolean }) => {
  const { noteId, workspaceId } = params;
  const [note, setNote] = useState<Note | null>(null);

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

  return <NoteEditor note={note} onSave={handleUpdateNote} readonly={readonly} />;
};

export default NotePage;
