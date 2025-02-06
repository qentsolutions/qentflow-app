import { useEffect, useState, useRef } from "react";
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
import { Button } from "@/components/ui/button";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Highlighter,
  Type,
  Download,
  ChevronDown,
  Plus,
  Minus,
  Undo,
  Redo
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

const fontFamilies = [
  'Arial',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Helvetica',
];

const fontSizes = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72
];

export function Editor({ document, onContentChange }: EditorProps) {
  const [content, setContent] = useState(document.content || "");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [fontSize, setFontSize] = useState(11);
  const debouncedContent = useDebounce(content, 1000);
  const { currentWorkspace } = useCurrentWorkspace();

  const editorRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const highlightPickerRef = useRef<HTMLDivElement>(null);
  const fontFamilyRef = useRef<HTMLDivElement>(null);
  const fontSizeRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
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
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'text-black', // Texte en noir pour les en-têtes de tableau
        },
      }),
      TableHeader,
      TableCell,
      TableCell.configure({
        HTMLAttributes: {
          class: 'text-black border border-black', // Texte en noir pour les cellules du tableau
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
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none p-6",
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
      onContentChange();
    },
  });

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

      if (showHighlightPicker && highlightPickerRef.current && !highlightPickerRef.current.contains(target)) {
        setShowHighlightPicker(false);
      }

      if (showFontFamily && fontFamilyRef.current && !fontFamilyRef.current.contains(target)) {
        setShowFontFamily(false);
      }

      if (showFontSize && fontSizeRef.current && !fontSizeRef.current.contains(target)) {
        setShowFontSize(false);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mousedown', handleClickOutside);
      return () => window.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showExportMenu, showColorPicker, showHighlightPicker, showFontFamily, showFontSize]);

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 border-b bg-white sticky top-0 z-10">
        {/* Première ligne de la barre d'outils */}
        <div className="flex items-center justify-between gap-2 p-1 border-b">

          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          <div ref={exportMenuRef} className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              <span>Fichier</span>
              <ChevronDown className="h-4 w-4" />
            </Button>

            {showExportMenu && (
              <div className="absolute top-full left-0 mt-1 p-1 bg-white rounded-lg shadow-lg border z-10 min-w-[120px]">
                <button
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 rounded"
                  onClick={exportAsPDF}
                >
                  Exporter en PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Deuxième ligne de la barre d'outils */}
        <div className="flex items-center gap-2 p-1 flex-wrap">
          {/* Sélecteur de police */}
          <div ref={fontFamilyRef} className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFontFamily(!showFontFamily)}
              className="min-w-[120px] flex items-center justify-between"
            >
              <Type className="h-4 w-4 mr-2" />
              <span className="text-sm">Arial</span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>

            {showFontFamily && (
              <div className="absolute top-full left-0 mt-1 p-1 bg-white rounded-lg shadow-lg border z-10 min-w-[200px]">
                {fontFamilies.map((font) => (
                  <button
                    key={font}
                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 rounded"
                    style={{ fontFamily: font }}
                    onClick={() => {
                      editor.chain().focus().setFontFamily(font).run();
                      setShowFontFamily(false);
                    }}
                  >
                    {font}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sélecteur de taille */}
          <div ref={fontSizeRef} className="relative">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFontSize(!showFontSize)}
                className="min-w-[60px] flex items-center justify-between"
              >
                <span className="text-sm">{fontSize}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newSize = fontSize + 1;
                  setFontSize(newSize);
                  editor.chain().focus().setFontSize(`${newSize}px`).run();
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const newSize = Math.max(8, fontSize - 1);
                  setFontSize(newSize);
                  editor.chain().focus().setFontSize(`${newSize}px`).run();
                }}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>

            {showFontSize && (
              <div className="absolute top-full left-0 mt-1 p-1 bg-white rounded-lg shadow-lg border z-10 min-w-[100px]">
                {fontSizes.map((size) => (
                  <button
                    key={size}
                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-slate-100 rounded"
                    onClick={() => {
                      setFontSize(size);
                      editor.chain().focus().setFontSize(`${size}px`).run();
                      setShowFontSize(false);
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-slate-200 mx-2" />

          {/* Styles de texte */}
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
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive("strike") ? "bg-slate-200" : ""}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            className={editor.isActive("superscript") ? "bg-slate-200" : ""}
          >
            <SuperscriptIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            className={editor.isActive("subscript") ? "bg-slate-200" : ""}
          >
            <SubscriptIcon className="h-4 w-4" />
          </Button>

          <div className="h-5 w-px bg-slate-200 mx-2" />

          {/* Couleurs */}
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
              <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-lg border z-10">
                <div className="grid grid-cols-10 gap-1">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className="w-5 h-5 rounded hover:scale-110 transition-transform"
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

          <div ref={highlightPickerRef} className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHighlightPicker(!showHighlightPicker)}
              className="relative"
            >
              <Highlighter className="h-4 w-4" />
            </Button>

            {showHighlightPicker && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-lg border z-10">
                <div className="grid grid-cols-10 gap-1">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className="w-5 h-5 rounded hover:scale-110 transition-transform"
                      style={{ backgroundColor: color, border: color === '#ffffff' ? '1px solid #e2e8f0' : 'none' }}
                      onClick={() => {
                        editor.chain().focus().setHighlight({ color }).run();
                        setShowHighlightPicker(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-slate-200 mx-2" />

          {/* Alignement */}
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

          {/* Listes */}
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

          {/* Insertion */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const url = window.prompt('URL du lien:');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            className={editor.isActive("link") ? "bg-slate-200" : ""}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const url = window.prompt('URL de l\'image:');
              if (url) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            }}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          >
            <TableIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div ref={editorRef} className="bg-white shadow-sm rounded-lg">
        <EditorContent editor={editor} className="min-h-[500px]" />
      </div>
    </div>
  );
}