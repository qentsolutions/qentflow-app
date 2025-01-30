"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAction } from "@/hooks/use-action"
import { createBoardFromTemplate } from "@/actions/tasks/create-board-from-template"
import { boardTemplates } from "@/constants/board-templates"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Layout, Loader2 } from "lucide-react"
import Image from "next/image"

interface CreateBoardModalProps {
  isOpen: boolean
  onClose: () => void
  workspaceId: string
  templateId: string
}

export const CreateBoardModal = ({ isOpen, onClose, workspaceId, templateId }: CreateBoardModalProps) => {
  const router = useRouter()
  const [title, setTitle] = useState("")

  const template = boardTemplates.find((t) => t.id === templateId)

  const { execute, isLoading } = useAction(createBoardFromTemplate, {
    onSuccess: (data) => {
      toast.success("Board created successfully!")
      router.push(`/${workspaceId}/boards/${data.id}`)
      onClose()
    },
    onError: (error) => {
      toast.error(error)
    },
  })

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("Board title is required")
      return
    }

    execute({
      title,
      workspaceId,
      templateId,
    })
  }

  useEffect(() => {
    if (!isOpen) {
      setTitle("")
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Layout className="w-6 h-6 text-primary" />
                Create Board
              </DialogTitle>

            </DialogHeader>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Board Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter your board title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="bg-gray-50 border p-4 rounded-md">
                  <p className="text-sm text-gray-600">
                    Template: <span className="font-medium">{template?.title}</span>
                  </p>
                </div>
                <Image
                  src="/board-img.png"
                  alt="board image"
                  width={1200} // La largeur de l'image en pixels
                  height={200} // La hauteur de l'image en pixels
                  layout="responsive" // Cela permet à l'image de prendre la largeur complète de son conteneur
                  objectFit="cover" // Facultatif, mais permet de remplir l'espace sans déformation
                  className="border rounded-xl shadow-md"
                />
                <div className="flex justify-end gap-x-2">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="px-4 py-2">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Board"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

