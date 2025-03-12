"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, FileText, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { fetcher } from "@/lib/fetcher";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface ResourceSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    type: "board" | "document";
    onSelect: (resourceId: string) => Promise<void>;
    selectedResources: string[];
}

export function ResourceSelector({
    isOpen,
    onClose,
    projectId,
    type,
    onSelect,
    selectedResources,
}: ResourceSelectorProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const { currentWorkspace } = useCurrentWorkspace();
    const [isSelecting, setIsSelecting] = useState(false);

    const { data: resources } = useQuery({
        queryKey: [`workspace-${type}s`, currentWorkspace?.id],
        queryFn: () => fetcher(`/api/${type}s?workspaceId=${currentWorkspace?.id}`),
    });

    const filteredResources = resources?.filter(
        (resource: any) =>
            resource.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !selectedResources.includes(resource.id)
    );

    const handleSelect = async (resourceId: string) => {
        try {
            setIsSelecting(true);
            await onSelect(resourceId);
            toast.success(`${type === "board" ? "Board" : "Document"} added to project`);
        } catch (error) {
            toast.error("Failed to add resource to project");
        } finally {
            setIsSelecting(false);
        }
    };

    const ResourceIcon = type === "board" ? LayoutGrid : FileText;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ResourceIcon className="w-5 h-5" />
                        Add {type === "board" ? "Board" : "Document"} to Project
                    </DialogTitle>
                </DialogHeader>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={`Search ${type}s...`}
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <ScrollArea className="h-[400px] pr-4">
                    <AnimatePresence>
                        {filteredResources?.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="text-center py-8"
                            >
                                <ResourceIcon className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                                <p className="text-muted-foreground">
                                    No available {type}s found
                                </p>
                            </motion.div>
                        ) : (
                            <div className="space-y-2">
                                {filteredResources?.map((resource: any) => (
                                    <motion.div
                                        key={resource.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                    >
                                        <Card
                                            className="p-4 hover:shadow-md transition-all cursor-pointer"
                                            onClick={() => handleSelect(resource.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <ResourceIcon className="h-5 w-5 text-blue-600" />
                                                    <div>
                                                        <p className="font-medium">{resource.title}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Created {new Date(resource.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    disabled={isSelecting}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}