"use client"

import { toast } from "sonner"
import { Copy, MoreHorizontal, MoreVertical, Trash, Expand } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAction } from "@/hooks/use-action"
import { copyCard } from "@/actions/tasks/copy-card"
import { deleteCard } from "@/actions/tasks/delete-card"
import { useCardModal } from "@/hooks/use-card-modal"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import type { CardWithList } from "@/types"

interface ActionsProps {
  card: CardWithList
  readonly?: boolean;
  boardId: string;
}

export const Actions = ({ card, boardId, readonly = false }: ActionsProps) => {
  const params = useParams()
  const router = useRouter()
  const cardModal = useCardModal()
  const { currentWorkspace } = useCurrentWorkspace()

  const { execute: executeCopyCard, isLoading: isLoadingCopy } = useAction(copyCard, {
    onSuccess: (data) => {
      toast.success(`Card "${data.title}" copied`)
      cardModal.onClose()
    },
    onError: (error) => {
      toast.error(error)
    },
  })

  const { execute: executeDeleteCard, isLoading: isLoadingDelete } = useAction(deleteCard, {
    onSuccess: (data) => {
      toast.success(`Card "${data.title}" deleted`)
      cardModal.onClose()
    },
    onError: (error) => {
      toast.error(error)
    },
  })

  const onCopy = () => {
    const workspaceId = currentWorkspace?.id
    if (!workspaceId) {
      toast.error("Workspace ID is required.")
      return
    }
    executeCopyCard({
      id: card?.id,
      boardId,
      workspaceId,
    })
  }

  const onDelete = () => {
    const workspaceId = currentWorkspace?.id
    if (!workspaceId) {
      toast.error("Workspace ID is required.")
      return
    }
    executeDeleteCard({
      id: card?.id,
      boardId,
      workspaceId,
    })
  }

  const onExpand = () => {
    cardModal.onClose()
    router.push(`/${currentWorkspace?.id}/boards/${boardId}/cards/${card.id}`)
  }

  return (
    <div className="flex items-center gap-2">
      {!readonly && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onExpand}
          className="text-muted-foreground hover:text-foreground"
        >
          <Expand className="h-4 w-4" />
        </Button>
      )}
      {!readonly && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onCopy} disabled={isLoadingCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <p className="text-base text-muted-foreground mb-4">
                  Are you sure you want to delete this card? This action is irreversible.
                </p>
                <div className="flex items-center">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete()
                    }}
                    disabled={isLoadingDelete}
                    variant="destructive"
                    className="w-full justify-center mr-8"
                    size="default"
                  >
                    <Trash className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline" className="w-full justify-center cursor-pointer" size="default">
                      Cancel
                    </Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

    </div>
  )
}