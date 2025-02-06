import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Button } from "@/components/ui/button";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Download,
  ChevronDown
} from "lucide-react";
import { updateDocument } from "@/actions/documents/update-document";

interface EditorProps {
  document: any;
  onContentChange: () => void;
}

const colors = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
];

export function Editor({ document, onContentChange }: EditorProps) {
  const [content, setContent] = useState(document.content || "");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const debouncedContent = useDebounce(content, 1000);
  const { currentWorkspace } = useCurrentWorkspace();
  const editorRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: document.content,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none p-6",
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
      onContentChange();
    },
  });

  const exportAsPNG = async () => {
    if (!editorRef.current) return;
    try {
      const canvas = await html2canvas(editorRef.current);
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'document.png';
      link.click();
      toast.success('Document exporté en PNG');
    } catch (error) {
      toast.error('Erreur lors de l\'export en PNG');
    }
    setShowExportMenu(false);
  };

  const exportAsPDF = async () => {
    if (!editorRef.current) return;
    try {
      const canvas = await html2canvas(editorRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('document.pdf');
      toast.success('Document exporté en PDF');
    } catch (error) {
      toast.error('Erreur lors de l\'export en PDF');
    }
    setShowExportMenu(false);
  };

  useEffect(() => {
    const updateContent = async () => {
      if (debouncedContent === document.content) return;

      try {
        const result = await updateDocument({
          id: document.id,
          content: debouncedContent,
          workspaceId: currentWorkspace?.id as string,
        });

        if (result.error) {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error("Failed to save changes");
      }
    };

    updateContent();
  }, [debouncedContent, document.id, document.content, currentWorkspace?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (showExportMenu && exportMenuRef.current && !exportMenuRef.current.contains(target)) {
        setShowExportMenu(false);
      }
      
      if (showColorPicker && colorPickerRef.current && !colorPickerRef.current.contains(target)) {
        setShowColorPicker(false);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mousedown', handleClickOutside);
      return () => window.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showExportMenu, showColorPicker]);

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b p-2 flex-wrap justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "bg-slate-200" : ""}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "bg-slate-200" : ""}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive("underline") ? "bg-slate-200" : ""}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") ? "bg-slate-200" : ""}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive("orderedList") ? "bg-slate-200" : ""}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <div className="h-5 w-px bg-slate-200 mx-2" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? "bg-slate-200" : ""}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? "bg-slate-200" : ""}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? "bg-slate-200" : ""}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={editor.isActive({ textAlign: 'justify' }) ? "bg-slate-200" : ""}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>

          <div className="h-5 w-px bg-slate-200 mx-2" />

          <div ref={colorPickerRef} className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="relative"
            >
              <Palette className="h-4 w-4" />
            </Button>
            
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 p-2 w-[250px] bg-white rounded-lg shadow-lg border z-10">
                <div className="gap-1">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className="w-5 m-1 h-5 rounded hover:scale-110 transition-transform"
                      style={{ backgroundColor: color, border: color === '#ffffff' ? '1px solid #e2e8f0' : 'none' }}
                      onClick={() => {
                        editor.chain().focus().setColor(color).run();
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div ref={exportMenuRef} className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            <span>Exporter</span>
            <ChevronDown className="h-4 w-4" />
          </Button>

          {showExportMenu && (
            <div className="absolute top-full right-0 mt-1 p-1 bg-white rounded-lg shadow-lg border z-10 min-w-[120px]">
              <button
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 rounded"
                onClick={exportAsPNG}
              >
                PNG
              </button>
              <button
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 rounded"
                onClick={exportAsPDF}
              >
                PDF
              </button>
            </div>
          )}
        </div>
      </div>
      <div ref={editorRef}>
        <EditorContent editor={editor} className="min-h-[500px]" />
      </div>
    </div>
  );
}