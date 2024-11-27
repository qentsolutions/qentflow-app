import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import FontSize from 'tiptap-extension-font-size';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Palette, List } from 'lucide-react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const [showColorPalette, setShowColorPalette] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Color,
      TextStyle,
      FontSize.configure({
        types: ['textStyle'],
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const colors = [
    '#000000', '#666666', '#999999', '#FFFFFF', '#FF0000', 
    '#00FF00', '#0000FF', '#FF00FF', '#FFFF00', '#00FFFF'
  ];

  const fontSizes = Array.from({ length: 24 }, (_, i) => (i + 1) * 2);

  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  const handleColorSelect = (e: React.MouseEvent, color: string) => {
    e.preventDefault();
    e.stopPropagation();
    editor.chain().focus().setColor(color).run();
    setShowColorPalette(false);
  };

  const toggleColorPalette = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowColorPalette(!showColorPalette);
  };

  const handleFontSizeChange = (value: string) => {
    editor.chain().focus().setFontSize(`${value}px`).run();
  };

  const stopPropagation = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="border rounded-md" onClick={stopPropagation} onKeyDown={stopPropagation}>
      <div className="border-b p-2 flex gap-2 flex-wrap items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleBold().run())}
          className={editor.isActive('bold') ? 'bg-secondary' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleItalic().run())}
          className={editor.isActive('italic') ? 'bg-secondary' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => handleButtonClick(e, () => editor.chain().focus().toggleBulletList().run())}
          className={editor.isActive('bulletList') ? 'bg-secondary' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        
        <div onClick={stopPropagation}>
          <Select onValueChange={handleFontSizeChange} defaultValue="16">
            <SelectTrigger className="w-[80px] h-9">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent onClick={stopPropagation} onKeyDown={stopPropagation}>
              {fontSizes.map((size) => (
                <SelectItem 
                  key={size} 
                  value={size.toString()}
                  onClick={stopPropagation}
                >
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleColorPalette}
            className={showColorPalette ? 'bg-secondary' : ''}
          >
            <Palette className="h-4 w-4" />
          </Button>
          {showColorPalette && (
            <div className="absolute top-full right-0 mt-1 bg-white border rounded-md p-2 shadow-lg z-50">
              <div className="grid grid-cols-5 gap-1" style={{ width: '160px' }}>
                {colors.map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded-sm border border-gray-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={(e) => handleColorSelect(e, color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <EditorContent editor={editor} className="prose max-w-none p-4" />
    </div>
  );
};

export default RichTextEditor;