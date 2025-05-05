"use client"; // Ajoutez cette ligne en haut du fichier

import { useEffect, useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import FontFamily from "@tiptap/extension-font-family";
import Placeholder from "@tiptap/extension-placeholder";

import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { fetcher } from "@/lib/fetcher";
import { updateBoardDocument } from "@/actions/board-documents/update-document";
import { DocumentToolbar } from "./document-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { FileDown, Clock, Expand, X, PenOff, Pen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Add these animation keyframes after imports
const animationStyles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes expandIn {
  from {
    transform: translate(calc(50% - 50vw), calc(50% - 50vh)) scale(0.6);
    opacity: 0;
  }
  to {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
}

@keyframes expandOut {
  from {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  to {
    transform: translate(calc(50% - 50vw), calc(50% - 50vh)) scale(0.6);
    opacity: 0;
  }
}

.animate-fadeIn {
  animation: fadeIn 0.4s ease-in-out forwards;
}

.animate-fadeOut {
  animation: fadeOut 0.4s ease-in-out forwards;
}

.animate-expandIn {
  animation: expandIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transform-origin: center center;
}

.animate-expandOut {
  animation: expandOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transform-origin: center center;
}

.toolbar-visible {
  max-height: 200px;
  opacity: 1;
  transition: max-height 0.3s ease, opacity 0.3s ease, margin 0.3s ease;
  margin-bottom: 16px;
}

.toolbar-hidden {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease, margin 0.3s ease;
  margin-bottom: 0;
}

.toggle-button {
  transition: transform 0.3s ease, background-color 0.2s ease;
}

.toggle-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.toggle-button-active {
  transform: rotate(180deg);
}
`;

export default function DocumentEditor({ params }: any) {
  const { documentId, boardId, workspaceId } = params;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false); // État pour gérer l'affichage en plein écran
  const [isExiting, setIsExiting] = useState(false);
  const [toolbarVisible, setToolbarVisible] = useState(true); // État pour gérer la visibilité de la barre d'outils
  const debouncedContent = useDebounce(content, 1000);
  const debouncedTitle = useDebounce(title, 1000);
  const { currentWorkspace } = useCurrentWorkspace();
  const queryClient = useQueryClient();
  const editorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  // Fetch document data
  const { data: document, isLoading } = useQuery({
    queryKey: ["board-document", documentId],
    queryFn: () => fetcher(`/api/boards/${workspaceId}/${boardId}/documents/${documentId}`),
    enabled: !!documentId && !!boardId && !!workspaceId,
  });

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
          class: "text-blue-600 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-lg my-4",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full my-4",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-200 dark:border-gray-700 p-2",
        },
      }),
      FontFamily,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder: "Start writing...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg max-w-none focus:outline-none px-8 py-6 min-h-[calc(100vh-120px)]",
      },
    },
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  // Update editor content when document changes
  useEffect(() => {
    if (editor && document) {
      if (document.content !== undefined && document.content !== content) {
        editor.commands.setContent(document.content || "");
        setContent(document.content || "");
      }
      if (document.title !== title) {
        setTitle(document.title || "");
      }
    }
  }, [document, editor]);

  // Save changes when content or title changes
  useEffect(() => {
    const updateContent = async () => {
      // Only save if content or title has changed and we have a document
      if (
        !document ||
        (debouncedContent === document.content && debouncedTitle === document.title) ||
        !debouncedContent ||
        !debouncedTitle
      ) {
        return;
      }

      setIsSaving(true);
      try {
        const result = await updateBoardDocument({
          id: documentId,
          title: debouncedTitle,
          content: debouncedContent,
          boardId: boardId,
          workspaceId: workspaceId,
        });

        if (result.error) {
          toast.error(result.error);
        } else {
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({
            queryKey: ["board-document", documentId],
          });
          queryClient.invalidateQueries({
            queryKey: ["board-documents", boardId],
          });
          setLastSaved(new Date());
        }
      } catch (error) {
        toast.error("Failed to save changes");
      } finally {
        setIsSaving(false);
      }
    };

    updateContent();
  }, [debouncedContent, debouncedTitle, documentId, document, boardId, workspaceId, queryClient]);

  const exportToPDF = () => {
    toast.info("PDF export functionality coming soon");
  };

  const toggleToolbar = () => {
    setToolbarVisible(!toolbarVisible);
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-full mt-8" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-6 w-4/6" />
        <Skeleton className="h-6 w-full" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-xl font-medium text-gray-600">Document not found</h3>
          <p className="text-sm text-gray-500 mt-2">
            The document you&apos;re looking for doesn&apos;t exist or has been deleted
          </p>
        </div>
      </div>
    );
  }

  const exitFullScreen = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsFullScreen(false);
      setIsExiting(false);
    }, 400); // Match this with the animation duration
  };

  return (
    <>
      <style jsx global>
        {animationStyles}
      </style>
      <div className={`flex flex-col h-full ${isFullScreen ? "fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out" : ""}`}>
        <div className={`relative w-full h-full overflow-auto ${isFullScreen ? "p-8 md:px-36" : "px-8 pt-4"} bg-white rounded-lg shadow-lg transition-transform duration-300 ${isFullScreen ? (isExiting ? "animate-expandOut" : "animate-expandIn") : ""}`}>
          {isFullScreen && (
            <button className="absolute top-4 right-4 text-gray-600 hover:text-gray-800" onClick={exitFullScreen}>
              <X className="h-6 w-6" />
            </button>
          )}
          <div className="flex flex-col h-full">
            <div
              ref={titleRef}
              className="px-0 pt-0 flex items-center justify-between"
              onClick={() => titleRef.current?.querySelector("input")?.focus()}
            >
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled Document"
                className="text-3xl font-bold w-full border-none shadow-none focus:outline-none focus:ring-0 p-0 bg-transparent"
              />

              <button className="text-gray-600 hover:text-gray-800" onClick={() => setIsFullScreen(true)}>
                <Expand className="h-4 w-4 mr-2" />
              </button>
              <div className="flex items-center justify-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleToolbar}
                      className={`toggle-button h-8 w-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 focus:outline-none ${!toolbarVisible ? "bg-gray-100" : ""}`}
                    >
                      {toolbarVisible ? <Pen className="h-4 w-4" /> : <PenOff className="h-4 w-4" />}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {toolbarVisible ? "Hide the toolbar" : "Show the toolbar"}
                  </TooltipContent>
                </Tooltip>

                <div className="flex items-center gap-2 ml-1">
                  <Button variant="outline" size="sm" onClick={exportToPDF} className="text-xs">
                    <FileDown className="h-3.5 w-3.5 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
              {lastSaved && (
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Last saved {formatDistanceToNow(lastSaved, { addSuffix: true })}</span>
                </div>
              )}
              {isSaving && <span>Saving...</span>}
            </div>


            <div className={`${toolbarVisible ? "toolbar-visible" : "toolbar-hidden"}`}>
              <div className="bg-white border rounded-lg shadow-sm flex items-center justify-between mt-2">
                <DocumentToolbar editor={editor} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto" ref={editorRef}>
              {editor && <EditorContent editor={editor} className="min-h-[calc(100vh-200px)]" />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
