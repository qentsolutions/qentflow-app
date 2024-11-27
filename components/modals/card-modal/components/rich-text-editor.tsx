import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import FontSize from 'tiptap-extension-font-size';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Palette, List, Type } from 'lucide-react';
import { useState } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showFontSizes, setShowFontSizes] = useState(false);
  
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
    // Noir et blanc
    '#000000', '#666666', '#999999', '#FFFFFF',
    // Couleurs vives
    '#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#FFFF00', '#00FFFF',
    // Pastels
    '#FFB6C1', '#98FB98', '#87CEFA', '#DDA0DD', '#F0E68C',
    // Tons chauds
    '#FF4500', '#FF8C00', '#FFA500', '#FFD700', '#BDB76B',
    // Tons froids
    '#4682B4', '#5F9EA0', '#6495ED', '#7B68EE', '#6A5ACD'
  ];

  // Génère des tailles de police de 8px à 72px
  const fontSizes = Array.from({ length: 33 }, (_, i) => (i + 4) * 2);

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

  const toggleFontSizes = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowFontSizes(!showFontSizes);
  };

  const handleFontSizeSelect = (e: React.MouseEvent, size: number) => {
    e.preventDefault();
    e.stopPropagation();
    editor.chain().focus().setFontSize(`${size}px`).run();
    setShowFontSizes(false);
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
        
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFontSizes}
            className={showFontSizes ? 'bg-secondary' : ''}
          >
            <Type className="h-4 w-4" />
          </Button>
          {showFontSizes && (
            <div className="absolute top-full left-0 mt-1 bg-white border rounded-md p-2 shadow-lg z-50 w-[120px] max-h-[200px] overflow-y-auto">
              <div className="flex flex-col gap-1">
                {fontSizes.map((size) => (
                  <button
                    key={size}
                    className="px-2 py-1 text-left hover:bg-gray-100 rounded text-sm"
                    onClick={(e) => handleFontSizeSelect(e, size)}
                  >
                    {size}px
                  </button>
                ))}
              </div>
            </div>
          )}
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
              <div className="grid grid-cols-5 gap-1 max-h-[200px] overflow-y-auto" style={{ width: '160px' }}>
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