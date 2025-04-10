"use client";

import { Editor } from "@tiptap/react";
import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Link as LinkIcon,
    Image as ImageIcon,
    Table as TableIcon,
    Palette,
    Type
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface DocumentToolbarProps {
    editor: Editor;
}

export function DocumentToolbar({ editor }: DocumentToolbarProps) {
    const [linkUrl, setLinkUrl] = useState("");

    if (!editor) {
        return null;
    }

    const addImage = () => {
        const url = prompt('Enter image URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const addLink = () => {
        if (linkUrl) {
            editor.chain().focus().setLink({ href: linkUrl }).run();
            setLinkUrl("");
        }
    };

    const addTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    return (
        <div className="border-b p-2 flex flex-wrap items-center gap-1 bg-gray-50">
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'bg-gray-200' : ''}
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'bg-gray-200' : ''}
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={editor.isActive('underline') ? 'bg-gray-200' : ''}
                >
                    <Underline className="h-4 w-4" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}
                >
                    <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}
                >
                    <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}
                >
                    <AlignRight className="h-4 w-4" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <Type className="h-4 w-4" />
                        <span className="text-xs">Heading</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                        <Heading1 className="h-4 w-4 mr-2" />
                        Heading 1
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                        <Heading2 className="h-4 w-4 mr-2" />
                        Heading 2
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                        <Heading3 className="h-4 w-4 mr-2" />
                        Heading 3
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <div className="flex items-center gap-1">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <LinkIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-3">
                        <div className="flex items-center gap-2">
                            <Input
                                placeholder="https://example.com"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                className="flex-1"
                            />
                            <Button size="sm" onClick={addLink}>Add Link</Button>
                        </div>
                    </PopoverContent>
                </Popover>

                <Button variant="ghost" size="sm" onClick={addImage}>
                    <ImageIcon className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="sm" onClick={addTable}>
                    <TableIcon className="h-4 w-4" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm">
                        <Palette className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3">
                    <div className="grid grid-cols-5 gap-2">
                        {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
                            '#FF00FF', '#00FFFF', '#808080', '#800000', '#008000',
                            '#000080', '#808000', '#800080', '#008080', '#C0C0C0'].map((color) => (
                                <button
                                    key={color}
                                    className="w-8 h-8 rounded-md border border-gray-200"
                                    style={{ backgroundColor: color }}
                                    onClick={() => editor.chain().focus().setColor(color).run()}
                                />
                            ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}