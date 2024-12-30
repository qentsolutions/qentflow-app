"use client";

import React, { useEffect, useState } from "react";
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from "@/components/ui/select";

interface ListTagsProps {
    boardId: string;
}

type Tag = {
    id: string;
    name: string;
};

export const ListTags = ({ boardId }: ListTagsProps) => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!boardId) return;
        const fetchTags = async () => {
            try {
                const response = await fetch(`/api/boards/tags?boardId=${boardId}`, {
                    method: "GET",
                });
                if (!response.ok) throw new Error("Failed to fetch tags");
                const data = await response.json();
                setTags(data);
            } catch (error) {
                console.error("Error fetching tags:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTags();
    }, [boardId]);


    const handleSelectChange = (value: string) => {
        setSelectedTag(value);
    };

    return (
        <div className="max-w-sm mx-auto">
            <h2 className="text-lg font-semibold mb-4">Select a Tag</h2>
            {loading ? (
                <p>Loading tags...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <Select onValueChange={handleSelectChange} value={selectedTag || undefined}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a tag" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700 dark:text-black">
                        {tags.map((tag) => (
                            <SelectItem className="dark:bg-gray-700 dark:text-black" key={tag.id} value={tag.id}>
                                {tag.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
};
