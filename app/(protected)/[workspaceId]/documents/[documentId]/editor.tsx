"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { updateDocument } from "@/actions/documents/update-document";

interface EditorProps {
  document: any;
  onContentChange: () => void;
}

export function Editor({ document, onContentChange }: EditorProps) {
  const [content, setContent] = useState(document.content || "");
  const debouncedContent = useDebounce(content, 1000);
  const { currentWorkspace } = useCurrentWorkspace();

  const editor = useEditor({
    extensions: [StarterKit],
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

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b p-2">
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
      </div>
      <EditorContent editor={editor} className="min-h-[500px]" />
    </div>
  );
}