"use client";
import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Search,
    Calendar,
    Clock,
    AlertCircle,
    ArrowUpDown,
    Filter,
    Plus,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAction } from "@/hooks/use-action";
import { createNote } from "@/actions/notes/create-note";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import NotePage from "./[noteId]/page";

const formatTimeAgo = (date: string) => {
    const now = new Date();
    const createdAt = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);

    if (diffInSeconds === 0) {
        return "Just now";
    } else if (diffInSeconds < 60) {
        return `${diffInSeconds} sec ago`;
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} min ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
        return createdAt.toLocaleDateString();
    }
};

type Note = {
    createdAt: string;
    updatedAt: string;
    title: string;
    content?: string;
    id: string;
    createdBy: {
        name: string;
    };
};

export default function MyNotesPage() {
    const { currentWorkspace } = useCurrentWorkspace();
    const { setBreadcrumbs } = useBreadcrumbs();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [sortByUpdatedAt, setSortByUpdatedAt] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        document.title = "My Notes - Qentflow";
    }, []);

    useEffect(() => {
        setBreadcrumbs([{ label: "Notes" }]);
    }, [setBreadcrumbs]);

    const { data: notes, isLoading } = useQuery({
        queryKey: ["user-notes", currentWorkspace?.id],
        queryFn: () => fetcher(`/api/notes/current-user-notes?workspaceId=${currentWorkspace?.id}`),
        enabled: !!currentWorkspace?.id,
    });

    const isNotesArray = Array.isArray(notes);

    const filteredNotes = isNotesArray
        ? notes.filter((note: Note) => {
            const matchesSearch =
                note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.content?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        })
        : [];

    const sortedNotes = sortByUpdatedAt
        ? [...filteredNotes].sort((a: Note, b: Note) => {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        })
        : filteredNotes;

    const { execute, fieldErrors } = useAction(createNote, {
        onSuccess: (data: any) => {
            const newNote = data.note;
            queryClient.invalidateQueries({ queryKey: ["user-notes", currentWorkspace?.id] });
            setSelectedNote(newNote);
            toast.success("Note created successfully!");
            closeRef.current?.click();
        },
        onError: (error: any) => {
            toast.error(error.message);
        },
    });

    const handleAddNote = async () => {
        const newNote = await execute({ title: "", content: "", workspaceId: currentWorkspace?.id || "" });
        queryClient.invalidateQueries({ queryKey: ["user-notes", currentWorkspace?.id] });
    };

    const handleNoteClick = (note: Note) => {
        if (selectedNote?.id !== note.id) {
            setSelectedNote(note);
        }
    };

    const handleDeleteNote = () => {
        setSelectedNote(null);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen ">
                <div className="w-1/3 h-full bg-gray-100 m-4 rounded"></div>
                <div className="flex-1 h-full bg-gray-100 m-4 rounded"></div>
            </div>
        );
    }

    const clearAllFilters = () => {
        setSearchTerm("");
        setSortByUpdatedAt(false);
    };

    return (
        <div className="flex bg-background h-screen">
            <div className="w-1/3 bg-background border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-lg">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
                    <p className="text-3xl font-bold text-gray-800">Notes</p>
                    <div className="flex items-center gap-x-1 w-full">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <Input
                                className="pl-10 w-full bg-gray-50 dark:bg-gray-700 border-gray-300 focus:border-primary focus:ring-primary"
                                placeholder="Search notes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex space-x-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Filters
                                        {sortByUpdatedAt ? (
                                            <span className="ml-2 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs w-6 h-6">
                                                1
                                            </span>
                                        ) : null}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-sm">Filters</h4>
                                            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-auto p-0 text-muted-foreground">
                                                Clear all
                                            </Button>
                                        </div>
                                        <Separator />
                                        <div className="space-y-2">
                                            <h5 className="font-medium text-sm flex items-center">
                                                <Calendar className="mr-2 h-4 w-4" /> Date
                                            </h5>
                                            <Button
                                                variant={sortByUpdatedAt ? "secondary" : "outline"}
                                                size="sm"
                                                onClick={() => setSortByUpdatedAt(!sortByUpdatedAt)}
                                                className="w-full justify-start"
                                            >
                                                <ArrowUpDown className="mr-2 h-4 w-4" />
                                                {sortByUpdatedAt ? "Clear Sort" : "Sort by Updated Date"}
                                            </Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <Button variant="outline" onClick={handleAddNote}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Note
                            </Button>
                        </div>
                    </div>
                </div>
                <ScrollArea className="flex-grow">
                    <AnimatePresence>
                        {sortedNotes.map((note: Note) => (
                            <motion.div
                                key={note.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card
                                    className={`m-3 cursor-pointer transition-all duration-200 hover:shadow-md ${selectedNote?.id === note.id ? "border-blue-500 border" : ""}`}
                                    onClick={() => handleNoteClick(note)}
                                >
                                    <CardContent className="p-4">
                                        <p className="font-semibold text-sm text-gray-800">{note.title}</p>
                                        <p className="mb-2 text-xs text-gray-700 truncate max-w-36">{note.content}</p>
                                        <div className="flex items-center justify-between mt-4">
                                            <div className="flex items-center w-full justify-between space-x-2">
                                                <div className="flex items-center">
                                                    {note.updatedAt && (
                                                        <p className="text-xs text-gray-500">{formatTimeAgo(note.updatedAt)}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {sortedNotes.length === 0 && (
                        <div className="text-center py-10">
                            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                            <p className="text-gray-500 text-lg">No notes found</p>
                        </div>
                    )}
                </ScrollArea>
            </div>
            {selectedNote ? (
                <div className="bg-background w-full" key={selectedNote.id}>
                    <NotePage
                        params={{
                            noteId: selectedNote.id,
                            workspaceId: currentWorkspace?.id || "",
                        }}
                        readonly={false}
                        onDelete={handleDeleteNote}
                    />
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-full w-full flex items-center justify-center"
                >
                    <div className="text-center">
                        <Clock className="h-20 w-20 mx-auto text-gray-300 mb-6" />
                        <h2 className="text-3xl font-semibold text-gray-600">Select a note to view details</h2>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
