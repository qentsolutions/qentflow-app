"use client"

import type { Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  LinkIcon,
  ImageIcon,
  TableIcon,
  Palette,
  Type,
  Code,
  Quote,
  Strikethrough,
  CheckSquare,
  Undo,
  Redo,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DocumentToolbarProps {
  editor: Editor | null
}

export function DocumentToolbar({ editor }: DocumentToolbarProps) {
  const [linkUrl, setLinkUrl] = useState("")

  if (!editor) {
    return null
  }

  const addImage = () => {
    const url = prompt("Enter image URL")
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl("")
    }
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  return (
    <TooltipProvider>
      <div className="p-1 flex flex-wrap items-center gap-0.5">
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="h-7 w-7 p-0 rounded-full"
              >
                <Undo className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Undo
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="h-7 w-7 p-0 rounded-full"
              >
                <Redo className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Redo
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
              <Type className="h-3.5 w-3.5" />
              <span>Text</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[180px]">
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={`text-xs ${editor.isActive("paragraph") ? "bg-gray-100" : ""}`}
            >
              Normal text
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`text-xs ${editor.isActive("heading", { level: 1 }) ? "bg-gray-100" : ""}`}
            >
              <Heading1 className="h-3.5 w-3.5 mr-2" />
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`text-xs ${editor.isActive("heading", { level: 2 }) ? "bg-gray-100" : ""}`}
            >
              <Heading2 className="h-3.5 w-3.5 mr-2" />
              Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`text-xs ${editor.isActive("heading", { level: 3 }) ? "bg-gray-100" : ""}`}
            >
              <Heading3 className="h-3.5 w-3.5 mr-2" />
              Heading 3
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`h-7 w-7 p-0 rounded-full ${editor.isActive("bold") ? "bg-gray-100" : ""}`}
              >
                <Bold className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Bold
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`h-7 w-7 p-0 rounded-full ${editor.isActive("italic") ? "bg-gray-100" : ""}`}
              >
                <Italic className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Italic
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`h-7 w-7 p-0 rounded-full ${editor.isActive("underline") ? "bg-gray-100" : ""}`}
              >
                <Underline className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Underline
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`h-7 w-7 p-0 rounded-full ${editor.isActive("strike") ? "bg-gray-100" : ""}`}
              >
                <Strikethrough className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Strikethrough
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
                className={`h-7 w-7 p-0 rounded-full ${editor.isActive({ textAlign: "left" }) ? "bg-gray-100" : ""}`}
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Align left
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
                className={`h-7 w-7 p-0 rounded-full ${editor.isActive({ textAlign: "center" }) ? "bg-gray-100" : ""}`}
              >
                <AlignCenter className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Align center
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
                className={`h-7 w-7 p-0 rounded-full ${editor.isActive({ textAlign: "right" }) ? "bg-gray-100" : ""}`}
              >
                <AlignRight className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Align right
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`h-7 w-7 p-0 rounded-full ${editor.isActive("bulletList") ? "bg-gray-100" : ""}`}
              >
                <List className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Bullet list
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`h-7 w-7 p-0 rounded-full ${editor.isActive("orderedList") ? "bg-gray-100" : ""}`}
              >
                <ListOrdered className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Numbered list
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`h-7 w-7 p-0 rounded-full ${editor.isActive("codeBlock") ? "bg-gray-100" : ""}`}
              >
                <Code className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Code block
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`h-7 w-7 p-0 rounded-full ${editor.isActive("blockquote") ? "bg-gray-100" : ""}`}
              >
                <Quote className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Quote
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <div className="flex items-center">
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full">
                    <LinkIcon className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Add link
              </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-72 p-3">
              <div className="flex flex-col gap-2">
                <div className="text-xs font-medium">Insert Link</div>
                <Input
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="h-8 text-xs"
                />
                <Button size="sm" onClick={addLink} className="w-full text-xs h-8">
                  Add Link
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={addImage} className="h-7 w-7 p-0 rounded-full">
                <ImageIcon className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Add image
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={addTable} className="h-7 w-7 p-0 rounded-full">
                <TableIcon className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Add table
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full">
                  <Palette className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Text color
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-64 p-3">
            <div className="space-y-2">
              <div className="text-xs font-medium">Text Color</div>
              <div className="grid grid-cols-5 gap-2">
                {[
                  "#000000",
                  "#5c5c5c",
                  "#737373",
                  "#a3a3a3",
                  "#d4d4d4",
                  "#e11d48",
                  "#ea580c",
                  "#eab308",
                  "#16a34a",
                  "#0ea5e9",
                  "#8b5cf6",
                  "#ec4899",
                  "#ef4444",
                  "#f97316",
                  "#facc15",
                  "#22c55e",
                  "#06b6d4",
                  "#6366f1",
                  "#d946ef",
                  "#f43f5e",
                ].map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded-md border border-gray-200 flex items-center justify-center"
                    style={{ backgroundColor: color }}
                    onClick={() => editor.chain().focus().setColor(color).run()}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  )
}
