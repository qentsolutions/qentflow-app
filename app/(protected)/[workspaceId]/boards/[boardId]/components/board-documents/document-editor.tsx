"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import FontFamily from '@tiptap/extension-font-family';

import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDown, Save } from "lucide-react";
import { updateBoardDocument } from "@/actions/board-documents/update-document";
import { DocumentToolbar } from "./document-toolbar";

interface DocumentEditorProps {
    document: any;
    onTitleChange?: (title: string) => void;
}

export function DocumentEditor({ document, onTitleChange }: DocumentEditorProps) {
    const [title, setTitle] = useState(document.title || "");
    const [content, setContent] = useState(document.content || "");
    const [isSaving, setIsSaving] = useState(false);
    const debouncedContent = useDebounce(content, 1000);
    const { currentWorkspace } = useCurrentWorkspace();
    const params = useParams();
    const queryClient = useQueryClient();

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
            }),
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            Underline,
            Superscript,
            Subscript,
            Typography,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full rounded-lg shadow-lg',
                },
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse table-auto w-full',
                },
            }),
            TableRow,
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border border-gray-300 dark:border-gray-700 p-2 bg-gray-100 dark:bg-gray-800',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-gray-300 dark:border-gray-700 p-2',
                },
            }),
            FontFamily,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: document.content,
        editorProps: {
            attributes: {
                class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-6 min-h-[500px]",
            },
        },
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML());
        },
    });

    useEffect(() => {
        const updateContent = async () => {
            if (debouncedContent === document.content) return;

            setIsSaving(true);
            try {
                const result = await updateBoardDocument({
                    id: document.id,
                    title,
                    content: debouncedContent,
                    boardId: params.boardId as string,
                    workspaceId: currentWorkspace?.id as string,
                });

                if (result.error) {
                    toast.error(result.error);
                } else {
                    queryClient.invalidateQueries({
                        queryKey: ["board-document", document.id],
                    });
                }
            } catch (error) {
                toast.error("Failed to save changes");
            } finally {
                setIsSaving(false);
            }
        };

        updateContent();
    }, [debouncedContent, document.id, document.content, title, params.boardId, currentWorkspace?.id, queryClient]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (onTitleChange) {
            onTitleChange(newTitle);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await updateBoardDocument({
                id: document.id,
                title,
                content,
                boardId: params.boardId as string,
                workspaceId: currentWorkspace?.id as string,
            });

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Document saved successfully");
                queryClient.invalidateQueries({
                    queryKey: ["board-document", document.id],
                });
            }
        } catch (error) {
            toast.error("Failed to save document");
        } finally {
            setIsSaving(false);
        }
    };

    const exportToPDF = () => {
        toast.info("PDF export functionality coming soon");
    };

    if (!editor) {
        return <div>Loading editor...</div>;
    }

    return (
        <Card className="shadow-none border-none">
            <CardContent className="p-0">
                <div className="flex flex-col h-full">
                    <div className="border-b p-4 flex justify-between items-center">
                        <Input
                            value={title}
                            onChange={handleTitleChange}
                            placeholder="Untitled Document"
                            className="text-xl font-bold border-none shadow-none focus-visible:ring-0 px-0 max-w-md"
                        />
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportToPDF}
                                className="flex items-center gap-1"
                            >
                                <FileDown className="h-4 w-4" />
                                Export
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                size="sm"
                                className="flex items-center gap-1"
                            >
                                <Save className="h-4 w-4" />
                                {isSaving ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </div>

                    <DocumentToolbar editor={editor} />

                    <div className="flex-1 overflow-y-auto bg-white">
                        <EditorContent editor={editor} className="min-h-[calc(100vh-200px)]" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}