"use client"

import { type ElementRef, useRef, useState } from "react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createTag } from "@/actions/tasks/create-tag"
import { useAction } from "@/hooks/use-action"

interface CreateTagFormProps {
  boardId: string
}

export default function CreateTagForm({ boardId }: CreateTagFormProps) {
  const queryClient = useQueryClient()
  const formRef = useRef<ElementRef<"form">>(null)
  const inputRef = useRef<ElementRef<"input">>(null)

  const [tagName, setTagName] = useState("")
  const [tagColor, setTagColor] = useState("#3B82F6")

  const { execute } = useAction(createTag, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["available-tags", boardId],
      })
      toast.success("Tag created successfully!")
      setTagName("")
      setTagColor("#3B82F6")
    },
    onError: (error) => {
      toast.error(error || "Failed to create tag")
    },
  })

  const onSubmit = (formData: FormData) => {
    const name = formData.get("tagName") as string
    const color = (formData.get("tagColor") as string) || tagColor

    if (!name) {
      toast.error("Tag name is required.")
      return
    }

    execute({ name, boardId, color })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Tag</CardTitle>
      </CardHeader>
      <form action={onSubmit} ref={formRef}>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Input
              ref={inputRef}
              id="tagName"
              name="tagName"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Enter tag name"
              className="flex-1"
            />
            <div className="relative">
              <Input
                type="color"
                id="tagColor"
                name="tagColor"
                value={tagColor}
                onChange={(e) => setTagColor(e.target.value)}
                className="w-12 h-12 p-1 cursor-pointer"
              />
              <div
                className="absolute inset-0 pointer-events-none rounded-md"
                style={{ boxShadow: `0 0 0 2px ${tagColor}33` }}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Tag
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

