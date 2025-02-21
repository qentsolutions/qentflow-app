"use client";
import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Search,
    CheckCircle2,
    Calendar,
    Clock,
    AlertCircle,
    ArrowUpDown,
    Filter,
    Plus,
    Flag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

    if (diffInSeconds < 60) {
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
    const [selectedNote, setSelectedNote] = useState<any>(null);
    const [sortByUpdatedAt, setSortByUpdatedAt] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        document.title = "My Notes - QentFlow";
    }, []);

    useEffect(() => {
        setBreadcrumbs([{ label: "My Notes" }]);
    }, [setBreadcrumbs]);

    const { data: notes, isLoading } = useQuery({
        queryKey: ["user-notes", currentWorkspace?.id],
        queryFn: () => fetcher(`/api/notes/current-user-notes?workspaceId=${currentWorkspace?.id}`),
        enabled: !!currentWorkspace?.id,
    });

    // Vérifiez que notes est un tableau
    const isNotesArray = Array.isArray(notes);

    const filteredNotes = isNotesArray
        ? notes.filter((note: any) => {
            const matchesSearch =
                note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.content?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        })
        : [];

    const sortedNotes = sortByUpdatedAt
        ? [...filteredNotes].sort((a: any, b: any) => {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        })
        : filteredNotes;

    const { execute, fieldErrors } = useAction(createNote, {
        onSuccess: (data: any) => {
            toast.success("Note created successfully!");
            setSelectedNote(data.note);
            closeRef.current?.click();
        },
        onError: (error: any) => {
            toast.error(error.message);
        },
    });

    const handleAddNote = () => {
        execute({ title: "", content: "", workspaceId: currentWorkspace?.id || "" });
        queryClient.invalidateQueries({ queryKey: ["user-notes", currentWorkspace?.id] });
    };

    if (isLoading) {
        return (
            <div className="flex h-screen ">
                {/* Left Panel */}
                <div className="w-1/3 h-full bg-gray-100 m-4 rounded"></div>

                {/* Right Panel */}
                <div className="flex-1 h-full bg-gray-100 m-4 rounded"></div>
            </div>
        );
    }

    const clearAllFilters = () => {
        setSearchTerm("");
        setSortByUpdatedAt(false);
    };

    return (
        <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 h-[calc(100vh-70px)]">
            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col shadow-lg">
                <div className="p-6 border-b border-gray-200 space-y-4">
                    <p className="text-3xl font-bold text-gray-800">My Notes</p>
                    <div className="flex items-center gap-x-1 w-full">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <Input
                                className="pl-10 w-full bg-gray-50 border-gray-300 focus:border-primary focus:ring-primary"
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
                        {sortedNotes.map((note: any) => (
                            <motion.div
                                key={note.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card
                                    className={`m-3 cursor-pointer transition-all duration-200 hover:shadow-md ${selectedNote?.id === note.id ? "border-blue-500 border" : ""
                                        }`}
                                    onClick={() => setSelectedNote(note)}
                                >
                                    <CardContent className="p-4">
                                        <p className="font-semibold text-sm mb-2 text-gray-800">{note.title}</p>
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
                <div className="bg-background w-full">
                    <NotePage
                        params={{
                            noteId: selectedNote.id,
                            workspaceId: currentWorkspace?.id || "",
                        }}
                        readonly={false}
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
