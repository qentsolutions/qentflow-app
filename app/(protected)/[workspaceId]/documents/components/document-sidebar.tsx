import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Heading1,
    Heading2,
    Heading3,
    Italic,
    List,
    ListOrdered,
    Underline,
    Type,
    Settings2
} from "lucide-react";
import { Editor } from "@tiptap/react";

interface DocumentSidebarProps {
    editor: Editor | null;
}

const fontFamilies = [
    { name: "Sans", value: "Arial, sans-serif" },
    { name: "Serif", value: "Georgia, serif" },
    { name: "Mono", value: "Consolas, monospace" },
];

const fontSizes = [
    { name: "Petit", value: "12px" },
    { name: "Normal", value: "16px" },
    { name: "Grand", value: "20px" },
];

export const DocumentSidebar = ({ editor }: DocumentSidebarProps) => {
    const [selectedFont, setSelectedFont] = useState(fontFamilies[0]);
    const [selectedSize, setSelectedSize] = useState(fontSizes[1]);

    if (!editor) {
        return null;
    }

    return (
        <Card className="w-[300px] h-full border-l">
            <Tabs defaultValue="basic">
                <TabsList className="w-full">
                    <TabsTrigger value="basic" className="flex-1">
                        <Type className="h-4 w-4 mr-2" />
                        De base
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="flex-1">
                        <Settings2 className="h-4 w-4 mr-2" />
                        Avancé
                    </TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[calc(100vh-10rem)] px-4">
                    <TabsContent value="basic" className="space-y-6">
                        {/* Police de caractère */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium">Police de caractère</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {fontFamilies.map((font) => (
                                    <Button
                                        key={font.name}
                                        variant={selectedFont.name === font.name ? "default" : "outline"}
                                        className="w-full"
                                        onClick={() => {
                                            setSelectedFont(font);
                                            editor.chain().focus().setFontFamily(font.value).run();
                                        }}
                                    >
                                        <span style={{ fontFamily: font.value }}>{font.name}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Taille de police */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium">Taille de police</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {fontSizes.map((size) => (
                                    <Button
                                        key={size.name}
                                        variant={selectedSize.name === size.name ? "default" : "outline"}
                                        className="w-full"
                                        onClick={() => {
                                            setSelectedSize(size);
                                            editor.chain().focus().setFontSize(size.value).run();
                                        }}
                                    >
                                        {size.name}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Style de texte */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium">Style de texte</h3>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant={editor.isActive("bold") ? "default" : "outline"}
                                    onClick={() => editor.chain().focus().toggleBold().run()}
                                >
                                    <Bold className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={editor.isActive("italic") ? "default" : "outline"}
                                    onClick={() => editor.chain().focus().toggleItalic().run()}
                                >
                                    <Italic className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={editor.isActive("underline") ? "default" : "outline"}
                                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                                >
                                    <Underline className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        {/* Alignement */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium">Alignement</h3>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant={editor.isActive({ textAlign: 'left' }) ? "default" : "outline"}
                                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                                >
                                    <AlignLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={editor.isActive({ textAlign: 'center' }) ? "default" : "outline"}
                                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                                >
                                    <AlignCenter className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={editor.isActive({ textAlign: 'right' }) ? "default" : "outline"}
                                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                                >
                                    <AlignRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        {/* Titres */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium">Titres</h3>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    variant={editor.isActive("heading", { level: 1 }) ? "default" : "outline"}
                                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                >
                                    <Heading1 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={editor.isActive("heading", { level: 2 }) ? "default" : "outline"}
                                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                >
                                    <Heading2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={editor.isActive("heading", { level: 3 }) ? "default" : "outline"}
                                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                                >
                                    <Heading3 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        {/* Listes */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium">Listes</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant={editor.isActive("bulletList") ? "default" : "outline"}
                                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={editor.isActive("orderedList") ? "default" : "outline"}
                                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                >
                                    <ListOrdered className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="advanced">
                        {/* Ajoutez ici des options avancées comme les marges, l'espacement, etc. */}
                    </TabsContent>
                </ScrollArea>
            </Tabs>
        </Card>
    );
};