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
import { updateDocument } from "@/actions/documents/update-document";
import { DocumentSidebar } from "../components/document-sidebar";

interface EditorProps {
  document: any;
  onContentChange: () => void;
}

export function Editor({ document, onContentChange }: EditorProps) {
  const [content, setContent] = useState(document.content || "");
  const debouncedContent = useDebounce(content, 1000);
  const { currentWorkspace } = useCurrentWorkspace();
  const editorRef = useRef<HTMLDivElement>(null);

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
          class: 'text-black',
        },
      }),
      TableHeader,
      TableCell,
      TableCell.configure({
        HTMLAttributes: {
          class: 'text-black border border-black',
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

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="min-h-[500px]" />
      </div>
      <DocumentSidebar editor={editor} />
    </div>
  );
}