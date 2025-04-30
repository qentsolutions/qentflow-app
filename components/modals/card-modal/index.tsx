import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import type { CardWithList, Comment, ListWithCards } from "@/types"
import type { AuditLog } from "@prisma/client"
import { useCardModal } from "@/hooks/use-card-modal"
import { fetcher } from "@/lib/fetcher"
import { useParams } from "next/navigation"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"

import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Tabs, TabsTrigger, TabsContent, TabsList } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

import { Header } from "./header"
import { Description } from "./description"
import { Actions } from "./actions"
import { Activity } from "./activity"
import { Comments } from "./comments"
import { AttachmentList } from "./attachment-list"
import { FileUpload } from "@/components/file-upload"
import { DocumentSelector } from "./document-selector"
import { Priority } from "./priority"
import { Tasks } from "./tasks"
import { TagsComponent } from "./tags"
import { Hierarchy } from "./hierarchy"

import {
  ActivityIcon,
  ExternalLink,
  FileText,
  LogInIcon as Logs,
  MessageSquareText,
  Paperclip,
  Plus,
  Trash2,
} from "lucide-react"
import Details from "./details"
import DateComponent from "./date"

export const CardModal = () => {
  const id = useCardModal((state) => state.id)
  const isOpen = useCardModal((state) => state.isOpen)
  const onClose = useCardModal((state) => state.onClose)
  const { boardId } = useParams()
  const { currentWorkspace } = useCurrentWorkspace()
  const [isDocumentSelectorOpen, setIsDocumentSelectorOpen] = useState(false)
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false)
  const [isAssociateCardOpen, setIsAssociateCardOpen] = useState(false)
  const [isChildCardOpen, setIsChildCardOpen] = useState(false)
  const [visibleDocuments, setVisibleDocuments] = useState(2)
  const boardIdString = Array.isArray(boardId) ? boardId[0] : boardId

  const { data: cardData } = useQuery<CardWithList>({
    queryKey: ["card", id],
    queryFn: () => fetcher(`/api/cards/${id}`),
  })

  const { data: commentsData } = useQuery<Comment[]>({
    queryKey: ["card-comments", id],
    queryFn: () => fetcher(`/api/cards/${id}/comments`),
  })

  const { data: auditLogsData } = useQuery<AuditLog[]>({
    queryKey: ["card-logs", id],
    queryFn: () => fetcher(`/api/cards/${id}/logs`),
  })

  const { data: availableTags } = useQuery({
    queryKey: ["available-tags", boardId],
    queryFn: () => fetcher(`/api/boards/tags?boardId=${boardId}`),
  })

  const handleDocumentClick = (documentId: string) => {
    window.open(`/${currentWorkspace?.id}/documents/${documentId}`, "_blank")
  }

  const { data: attachments, refetch: refetchAttachments } = useQuery({
    queryKey: ["card-attachments", id],
    queryFn: () => fetcher(`/api/cards/${id}/attachments`),
  })

  const lists: ListWithCards[] = [
    // Add your lists here
  ]

  const setOrderedData = (data: ListWithCards[]) => {
    // Implement your logic to update the ordered data
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto p-0 max-w-3xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl" side="rightLarge">
        <div className="h-full flex flex-col">
          <div className="pr-6 pt-6 pb-2 border-b">
            {!cardData ? (
              <Header.Skeleton />
            ) : (
              <div className="flex items-center justify-between">
                <Header data={cardData} boardId={boardIdString} />
                <Actions card={cardData} boardId={boardIdString} lists={lists} setOrderedData={setOrderedData} />
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
              <div className="col-span-2 space-y-6">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsDocumentSelectorOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Document
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAttachmentDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Attachment
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAssociateCardOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Associate Card
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsChildCardOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Child Card
                  </Button>
                </div>

                <DocumentSelector
                  isOpen={isDocumentSelectorOpen}
                  onClose={() => setIsDocumentSelectorOpen(false)}
                  cardId={cardData?.id || ""}
                  workspaceId={currentWorkspace?.id!}
                />

                <Dialog open={isAttachmentDialogOpen} onOpenChange={setIsAttachmentDialogOpen}>
                  <DialogContent>
                    <DialogTitle>Add Attachment</DialogTitle>
                    <FileUpload
                      cardId={cardData?.id || ""}
                      workspaceId={currentWorkspace?.id!}
                      onUploadComplete={() => {
                        refetchAttachments()
                        setIsAttachmentDialogOpen(false)
                      }}
                    />
                    {attachments && attachments.length > 0 && (
                      <>
                        <h3 className="text-lg font-semibold mt-4">All Attachments</h3>
                        <ScrollArea className="h-56 mt-2">
                          <div className="space-y-2">
                            {attachments.map((attachment: any) => (
                              <div
                                key={attachment.id}
                                className="p-3 bg-white dark:bg-gray-800 rounded-lg border flex items-center justify-between"
                              >
                                <div className="flex items-center space-x-3">
                                  <div>
                                    <a
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline font-medium text-sm truncate max-w-[200px] inline-block"
                                    >
                                      {attachment.name.length > 20
                                        ? `${attachment.name.substring(0, 40)}...`
                                        : attachment.name}
                                    </a>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    // Logique pour supprimer l'attachment (à implémenter si nécessaire)
                                  }}
                                >
                                  <Trash2 size={16} className="text-red-500" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </>
                    )}
                  </DialogContent>
                </Dialog>

                {!cardData ? <Description.Skeleton /> : <Description data={cardData} />}

                {!cardData ? (
                  <Description.Skeleton />
                ) : (
                  <div className="mt-2">
                    <Hierarchy
                      data={cardData}
                      isAssociateCardOpen={isAssociateCardOpen}
                      setIsAssociateCardOpen={setIsAssociateCardOpen}
                      isChildCardOpen={isChildCardOpen}
                      setIsChildCardOpen={setIsChildCardOpen}
                    />
                  </div>
                )}

                {!cardData ? <Tasks.Skeleton /> : <Tasks cardId={cardData.id} />}

                {cardData?.documents && cardData.documents.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center">
                        <FileText size={16} className="mr-2" /> Documents
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {cardData.documents.slice(0, visibleDocuments).map((doc: any) => (
                        <div
                          key={doc.id}
                          className="p-3 bg-white dark:bg-gray-800 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition flex items-center justify-between"
                          onClick={() => handleDocumentClick(doc.id)}
                        >
                          <div className="flex items-center gap-x-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <p className="font-medium text-sm truncate max-w-[200px]">{doc.title}</p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-blue-500" />
                        </div>
                      ))}

                      {cardData.documents.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setVisibleDocuments((prev) => (prev === 2 ? cardData.documents.length : 2))}
                          className="w-full mt-2 text-blue-500 hover:text-blue-600"
                        >
                          {visibleDocuments === 2 ? `See more (${cardData.documents.length - 2})` : "See less"}
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {attachments && attachments.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Paperclip size={16} className="mr-2" /> Attachments
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {!cardData ? <AttachmentList.Skeleton /> : <AttachmentList cardId={cardData?.id || ""} />}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <ActivityIcon size={16} className="mr-2" /> Activity
                  </h3>

                  <Tabs defaultValue="comments" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="comments" className="flex items-center gap-1">
                        <MessageSquareText size={14} /> Comments
                      </TabsTrigger>
                      <TabsTrigger value="logs" className="flex items-center gap-1">
                        <Logs size={14} /> History
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="comments" className="mt-0">
                      {!commentsData ? (
                        <Comments.Skeleton />
                      ) : (
                        <Comments items={commentsData} cardId={cardData?.id ?? ""} />
                      )}
                    </TabsContent>

                    <TabsContent value="logs" className="mt-4">
                      {!auditLogsData ? <Activity.Skeleton /> : <Activity items={auditLogsData} />}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>

              <div className="space-y-6">
                {!cardData ? (
                  <Description.Skeleton />
                ) : (
                  <>
                    <Details card={cardData} />
                    <TagsComponent data={cardData} availableTags={availableTags ?? []} />
                    <Priority data={cardData} />
                    <DateComponent card={cardData} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
