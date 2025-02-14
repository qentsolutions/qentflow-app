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
  Settings2,
  Palette,
  Link as LinkIcon,
  Image as ImageIcon,
  Table,
  Highlighter,
  Superscript,
  Subscript,
  Quote,
  Code,
  Strikethrough,
  CaseSensitive
} from "lucide-react";
import { Editor } from "@tiptap/react";

interface DocumentSidebarProps {
  editor: Editor | null;
}

const fontFamilies = [
  { name: "Sans", value: "Arial, sans-serif" },
  { name: "Serif", value: "Georgia, serif" },
  { name: "Mono", value: "Consolas, monospace" },
  { name: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { name: "Times", value: "Times New Roman, serif" },
  { name: "Courier", value: "Courier New, monospace" },
];

const fontSizes = [
  { name: "Small", value: "12px" },
  { name: "Normal", value: "16px" },
  { name: "Medium", value: "18px" },
  { name: "Large", value: "24px" },
  { name: "XL", value: "32px" },
];

const colors = [
  { name: "Black", value: "#000000" },
  { name: "Gray", value: "#666666" },
  { name: "Red", value: "#FF0000" },
  { name: "Blue", value: "#0000FF" },
  { name: "Green", value: "#00FF00" },
  { name: "Yellow", value: "#FFFF00" },
  { name: "Purple", value: "#800080" },
];

export const DocumentSidebar = ({ editor }: DocumentSidebarProps) => {
  const [selectedFont, setSelectedFont] = useState(fontFamilies[0]);
  const [selectedSize, setSelectedSize] = useState(fontSizes[1]);
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (!editor) {
    return null;
  }

  const toggleStyle = (style: string) => {
    switch (style) {
      case "bold":
        editor.chain().focus().toggleBold().run();
        break;
      case "italic":
        editor.chain().focus().toggleItalic().run();
        break;
      case "underline":
        editor.chain().focus().toggleUnderline().run();
        break;
      case "strike":
        editor.chain().focus().toggleStrike().run();
        break;
      case "superscript":
        editor.chain().focus().toggleSuperscript().run();
        break;
      case "subscript":
        editor.chain().focus().toggleSubscript().run();
        break;
      case "code":
        editor.chain().focus().toggleCode().run();
        break;
      case "highlight":
        editor.chain().focus().toggleHighlight().run();
        break;
    }
  };

  const setAlignment = (align: 'left' | 'center' | 'right') => {
    editor.chain().focus().setTextAlign(align).run();
  };

  const setHeading = (level: 1 | 2 | 3) => {
    editor.chain().focus().toggleHeading({ level }).run();
  };

  return (
    <Card className="w-[300px] h-full border-l">
      <Tabs defaultValue="text">
        <TabsList className="w-full">
          <TabsTrigger value="text" className="flex-1">
            <Type className="h-4 w-4 mr-2" />
            Text
          </TabsTrigger>
          <TabsTrigger value="format" className="flex-1">
            <Settings2 className="h-4 w-4 mr-2" />
            Format
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-10rem)] px-4">
          <TabsContent value="text" className="space-y-6">
            {/* Font Family */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Font Family</h3>
              <div className="grid grid-cols-2 gap-2">
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

            {/* Font Size */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Font Size</h3>
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

            {/* Text Style */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Text Style</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={editor.isActive("bold") ? "default" : "outline"}
                  onClick={() => toggleStyle("bold")}
                  className="w-full"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("italic") ? "default" : "outline"}
                  onClick={() => toggleStyle("italic")}
                  className="w-full"
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("underline") ? "default" : "outline"}
                  onClick={() => toggleStyle("underline")}
                  className="w-full"
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("strike") ? "default" : "outline"}
                  onClick={() => toggleStyle("strike")}
                  className="w-full"
                >
                  <Strikethrough className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("superscript") ? "default" : "outline"}
                  onClick={() => toggleStyle("superscript")}
                  className="w-full"
                >
                  <Superscript className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("subscript") ? "default" : "outline"}
                  onClick={() => toggleStyle("subscript")}
                  className="w-full"
                >
                  <Subscript className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Color Picker */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Text Color</h3>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <Button
                    key={color.name}
                    className="w-full h-8 rounded-md"
                    style={{ backgroundColor: color.value }}
                    onClick={() => editor.chain().focus().setColor(color.value).run()}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="format" className="space-y-6">
            {/* Alignment */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Alignment</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={editor.isActive({ textAlign: 'left' }) ? "default" : "outline"}
                  onClick={() => setAlignment('left')}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive({ textAlign: 'center' }) ? "default" : "outline"}
                  onClick={() => setAlignment('center')}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive({ textAlign: 'right' }) ? "default" : "outline"}
                  onClick={() => setAlignment('right')}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Headings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Headings</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={editor.isActive("heading", { level: 1 }) ? "default" : "outline"}
                  onClick={() => setHeading(1)}
                >
                  <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("heading", { level: 2 }) ? "default" : "outline"}
                  onClick={() => setHeading(2)}
                >
                  <Heading2 className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("heading", { level: 3 }) ? "default" : "outline"}
                  onClick={() => setHeading(3)}
                >
                  <Heading3 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Lists */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Lists</h3>
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

            <Separator />

            {/* Special Formats */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Special Formats</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={editor.isActive("link") ? "default" : "outline"}
                  onClick={() => {
                    const url = window.prompt("Enter URL");
                    if (url) {
                      editor.chain().focus().setLink({ href: url }).run();
                    }
                  }}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("highlight") ? "default" : "outline"}
                  onClick={() => toggleStyle("highlight")}
                >
                  <Highlighter className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("code") ? "default" : "outline"}
                  onClick={() => toggleStyle("code")}
                >
                  <Code className="h-4 w-4" />
                </Button>
                <Button
                  variant={editor.isActive("blockquote") ? "default" : "outline"}
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                >
                  <Quote className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    editor.chain().focus().insertTable({
                      rows: 3,
                      cols: 3,
                      withHeaderRow: true
                    }).run();
                  }}
                >
                  <Table className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const url = window.prompt("Enter image URL");
                    if (url) {
                      editor.chain().focus().setImage({ src: url }).run();
                    }
                  }}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </Card>
  );
};