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
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DocumentSidebar } from "../components/document-sidebar";
import { Button } from "@/components/ui/button";
import { FileDown, Upload } from "lucide-react";
import { updateDocument } from "@/actions/documents/update-document";

interface EditorProps {
  document: any;
  onContentChange: () => void;
}

export function Editor({ document, onContentChange }: EditorProps) {
  const [content, setContent] = useState(document.content || "");
  const debouncedContent = useDebounce(content, 1000);
  const { currentWorkspace } = useCurrentWorkspace();
  const editorRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-6",
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
      onContentChange();
    },
  });

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

  const exportToPDF = async () => {
    if (!editorRef.current) return;

    try {
      const canvas = await html2canvas(editorRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${document.title || 'document'}.pdf`);
      
      toast.success("Document exported successfully!");
    } catch (error) {
      toast.error("Failed to export document");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('workspaceId', currentWorkspace?.id || '');
          formData.append('documentId', document.id);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) throw new Error('Upload failed');

          const { url } = await response.json();
          editor?.chain().focus().setImage({ src: url }).run();
          
          toast.success("Image uploaded successfully!");
        } catch (error) {
          toast.error("Failed to upload image");
        }
      } else {
        toast.error("Only image files are supported");
      }
    }
  };

  if (!editor) return null;

  return (
    <div className="flex h-full">
      <div 
        className={`flex-1 overflow-y-auto relative ${isDragging ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50/90 dark:bg-blue-900/90 z-50">
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto text-blue-500 mb-2" />
              <p className="text-lg font-medium text-blue-600">Drop files here</p>
              <p className="text-sm text-blue-500">Images will be uploaded and inserted</p>
            </div>
          </div>
        )}
        <div className="sticky top-0 z-10 bg-background dark:bg-gray-800 border-b p-2 flex justify-end gap-2">
          <Button
            onClick={exportToPDF}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
        <div ref={editorRef}>
          <EditorContent editor={editor} className="min-h-[500px]" />
        </div>
      </div>
      <DocumentSidebar editor={editor} />
    </div>
  );
}