"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TextStyle from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import Superscript from "@tiptap/extension-superscript"
import Subscript from "@tiptap/extension-subscript"
import Highlight from "@tiptap/extension-highlight"
import Typography from "@tiptap/extension-typography"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Table from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import FontFamily from "@tiptap/extension-font-family"
import Placeholder from "@tiptap/extension-placeholder"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Focus from "@tiptap/extension-focus"
import CharacterCount from "@tiptap/extension-character-count"

import { useDebounce } from "@/hooks/use-debounce"
import { toast } from "sonner"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { fetcher } from "@/lib/fetcher"
import { updateBoardDocument } from "@/actions/board-documents/update-document"
import { DocumentToolbar } from "./document-toolbar"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  FileDown,
  Clock,
  X,
  PenIcon as PenOff,
  Pen,
  Save,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Settings,
  Share,
  Download,
  FileText,
  Zap,
  BarChart3,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface DocumentEditorProps {
  params: {
    documentId: string
    boardId: string
    workspaceId: string
  }
}

export default function DocumentEditor({ params }: DocumentEditorProps) {
  const { documentId, boardId, workspaceId } = params
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [toolbarVisible, setToolbarVisible] = useState(true)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [autoSave, setAutoSave] = useState(true)
  const [wordCount, setWordCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const [saveProgress, setSaveProgress] = useState(0)

  const debouncedContent = useDebounce(content, autoSave ? 1000 : 0)
  const debouncedTitle = useDebounce(title, autoSave ? 1000 : 0)
  const { currentWorkspace } = useCurrentWorkspace()
  const queryClient = useQueryClient()
  const editorRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  // Fetch document data
  const {
    data: document,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["board-document", documentId],
    queryFn: () => fetcher(`/api/boards/${workspaceId}/${boardId}/documents/${documentId}`),
    enabled: !!documentId && !!boardId && !!workspaceId,
    retry: 3,
    staleTime: 30000,
  })

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
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: "highlight",
        },
      }),
      Underline,
      Superscript,
      Subscript,
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-primary underline decoration-primary/30 hover:decoration-primary transition-colors cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-lg my-4 shadow-sm border border-border",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full my-4 border border-border rounded-lg overflow-hidden",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-border p-3 bg-muted/50 font-semibold text-left",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-border p-3",
        },
      }),
      FontFamily,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "task-list",
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: "task-item",
        },
        nested: true,
      }),
      Focus.configure({
        className: "has-focus",
        mode: "all",
      }),
      CharacterCount,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return "What's the title?"
          }
          return "Start writing your story..."
        },
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none",
          "prose-headings:scroll-m-20 prose-headings:font-semibold prose-headings:tracking-tight",
          "prose-h1:text-4xl prose-h1:lg:text-5xl prose-h1:mb-6",
          "prose-h2:text-3xl prose-h2:mb-4 prose-h2:border-b prose-h2:pb-2",
          "prose-h3:text-2xl prose-h3:mb-3",
          "prose-p:leading-7 prose-p:mb-4",
          "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic",
          "prose-code:relative prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-1 prose-code:text-sm",
          "prose-pre:bg-muted prose-pre:border prose-pre:rounded-lg prose-pre:p-4",
          "prose-ul:my-6 prose-ol:my-6",
          "prose-li:my-2",
          "prose-table:my-6",
          "prose-img:rounded-lg prose-img:shadow-md",
          focusMode
            ? "prose-p:opacity-50 prose-li:opacity-50 prose-h1:opacity-50 prose-h2:opacity-50 prose-h3:opacity-50 focus-within:prose-p:opacity-100 focus-within:prose-li:opacity-100 focus-within:prose-h1:opacity-100 focus-within:prose-h2:opacity-100 focus-within:prose-h3:opacity-100"
            : "",
          "py-6 min-h-[calc(100vh-200px)] transition-all duration-200",
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setContent(html)

      // Calculate word count and reading time
      const text = editor.getText()
      const words = text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length
      setWordCount(words)
      setReadingTime(Math.ceil(words / 200)) // Average reading speed: 200 words per minute
    },
    onCreate: ({ editor }) => {
      // Set initial word count
      const text = editor.getText()
      const words = text
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length
      setWordCount(words)
      setReadingTime(Math.ceil(words / 200))
    },
  })

  // Update editor content when document changes
  useEffect(() => {
    if (editor && document) {
      if (document.content !== undefined && document.content !== content) {
        editor.commands.setContent(document.content || "")
        setContent(document.content || "")
      }
      if (document.title !== title) {
        setTitle(document.title || "")
      }
      if (document.updatedAt) {
        setLastSaved(new Date(document.updatedAt))
      }
    }
  }, [document, editor])

  // Auto-save functionality
  const saveDocument = useCallback(
    async (showToast = false) => {
      if (!document || !autoSave) return

      // Only save if content or title has changed
      if (
        (debouncedContent === document.content && debouncedTitle === document.title) ||
        !debouncedContent ||
        !debouncedTitle
      ) {
        return
      }

      setIsSaving(true)
      setSaveProgress(0)

      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setSaveProgress((prev) => Math.min(prev + 20, 90))
        }, 100)

        const result = await updateBoardDocument({
          id: documentId,
          title: debouncedTitle,
          content: debouncedContent,
          boardId: boardId,
          workspaceId: workspaceId,
        })

        clearInterval(progressInterval)
        setSaveProgress(100)

        if (result.error) {
          toast.error(result.error)
        } else {
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({
            queryKey: ["board-document", documentId],
          })
          queryClient.invalidateQueries({
            queryKey: ["board-documents", boardId],
          })
          setLastSaved(new Date())

          if (showToast) {
            toast.success("Document saved successfully")
          }
        }
      } catch (error) {
        toast.error("Failed to save changes")
      } finally {
        setIsSaving(false)
        setTimeout(() => setSaveProgress(0), 1000)
      }
    },
    [debouncedContent, debouncedTitle, documentId, document, boardId, workspaceId, queryClient, autoSave],
  )

  // Auto-save effect
  useEffect(() => {
    if (autoSave) {
      saveDocument()
    }
  }, [saveDocument, autoSave])

  // Manual save with Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        saveDocument(true)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault()
        setIsPreviewMode(!isPreviewMode)
      }
      if (e.key === "Escape" && isFullScreen) {
        exitFullScreen()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [saveDocument, isPreviewMode, isFullScreen])

  const exportToPDF = () => {
    toast.info("PDF export functionality coming soon")
  }

  const exportToMarkdown = () => {
    if (!editor) return

    const markdown = editor.storage.markdown?.getMarkdown() || editor.getText()
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title || "document"}.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Document exported as Markdown")
  }

  const shareDocument = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success("Document link copied to clipboard")
  }

  const toggleToolbar = () => {
    setToolbarVisible(!toolbarVisible)
  }

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  const toggleFocusMode = () => {
    setFocusMode(!focusMode)
  }

  const exitFullScreen = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsFullScreen(false)
      setIsExiting(false)
    }, 300)
  }

  const enterFullScreen = () => {
    setIsFullScreen(true)
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-1/3" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <FileText className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Document not found</h3>
            <p className="text-sm text-muted-foreground mt-2">
              The document you&apos;re looking for doesn&apos;t exist or has been deleted
            </p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div
        className={cn(
          "flex flex-col h-full transition-all duration-300",
          isFullScreen && "fixed inset-0 z-50 bg-background",
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
            isFullScreen ? "p-6" : "p-4",
          )}
        >
          <div className="flex items-center justify-between">
            {/* Title */}
            <div className="flex-1 mr-4">
              <input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled Document"
                className={cn(
                  "font-bold border-none shadow-none focus:outline-none focus:ring-0 p-0 bg-transparent w-full",
                  isFullScreen ? "text-4xl" : "text-2xl",
                )}
                disabled={isPreviewMode}
              />

              {/* Document stats */}
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  <span>{wordCount} words</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{readingTime} min read</span>
                </div>
                {editor && (
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span>{editor.storage.characterCount.characters()} characters</span>
                  </div>
                )}
                {lastSaved && (
                  <div className="flex items-center gap-1">
                    <Save className="h-3 w-3" />
                    <span>Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Save progress */}
              {isSaving && (
                <div className="flex items-center gap-2">
                  <Progress value={saveProgress} className="w-16 h-1" />
                  <span className="text-xs text-muted-foreground">Saving...</span>
                </div>
              )}

              {/* Mode toggles */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isPreviewMode ? "default" : "ghost"}
                      size="sm"
                      onClick={togglePreviewMode}
                      className="h-8 w-8 p-0"
                    >
                      {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isPreviewMode ? "Exit preview mode" : "Preview mode"} (Ctrl+E)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={focusMode ? "default" : "ghost"}
                      size="sm"
                      onClick={toggleFocusMode}
                      className="h-8 w-8 p-0"
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{focusMode ? "Exit focus mode" : "Focus mode"}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={toolbarVisible ? "default" : "ghost"}
                      size="sm"
                      onClick={toggleToolbar}
                      className="h-8 w-8 p-0"
                    >
                      {toolbarVisible ? <PenOff className="h-4 w-4" /> : <Pen className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{toolbarVisible ? "Hide toolbar" : "Show toolbar"}</TooltipContent>
                </Tooltip>
              </div>

              <Separator orientation="vertical" className="h-6" />

              {/* Export menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8">
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportToPDF}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToMarkdown}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export as Markdown
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Settings */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editor Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-save">Auto-save</Label>
                      <Switch id="auto-save" checked={autoSave} onCheckedChange={setAutoSave} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="focus-mode">Focus mode</Label>
                      <Switch id="focus-mode" checked={focusMode} onCheckedChange={setFocusMode} />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Share */}
              <Button variant="ghost" size="sm" onClick={shareDocument} className="h-8 w-8 p-0">
                <Share className="h-4 w-4" />
              </Button>

              {/* Fullscreen toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={isFullScreen ? exitFullScreen : enterFullScreen}
                    className="h-8 w-8 p-0"
                  >
                    {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}</TooltipContent>
              </Tooltip>

              {isFullScreen && (
                <Button variant="ghost" size="sm" onClick={exitFullScreen} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        {toolbarVisible && !isPreviewMode && (
          <div
            className={cn(
              "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
              isFullScreen ? "px-6" : "px-4",
            )}
          >
            <DocumentToolbar editor={editor} />
          </div>
        )}

        {/* Editor Content */}
        <div className={cn("flex-1 overflow-y-auto", isFullScreen ? "px-6 pb-6" : "px-4 pb-4")}>
          <div className={cn("max-w-4xl mx-auto", isFullScreen && "max-w-5xl")}>
            {editor && (
              <EditorContent
                editor={editor}
                className={cn(
                  "min-h-[calc(100vh-200px)] transition-all duration-200",
                  isPreviewMode && "pointer-events-none",
                  focusMode && "focus-mode",
                )}
              />
            )}
          </div>
        </div>

        {/* Status bar */}
        <div className={cn("border-t bg-muted/30 px-4 py-2 text-xs text-muted-foreground", isFullScreen && "px-6")}>
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-xs">
                {isPreviewMode ? "Preview" : "Edit"} Mode
              </Badge>
              {focusMode && (
                <Badge variant="outline" className="text-xs">
                  Focus Mode
                </Badge>
              )}
              {!autoSave && (
                <Badge variant="destructive" className="text-xs">
                  Auto-save disabled
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span>Ctrl+S to save • Ctrl+E to preview • Esc to exit fullscreen</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
