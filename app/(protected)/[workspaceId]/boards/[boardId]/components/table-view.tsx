"use client";

import { useCardModal } from "@/hooks/use-card-modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MessageSquare,
  Paperclip,
  CheckSquare,
  SignalLow,
  SignalMedium,
  SignalHigh,
  AlertTriangle,
  UserRound,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { deleteCard } from "@/actions/tasks/delete-card";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";

interface TableViewProps {
  boardId: string;
  users: any;
  data: {
    id: string;
    title: string;
    cards: {
      id: string;
      title: string;
      order: number;
      listId: string;
      createdAt: Date;
      priority: string;
      updatedAt: Date;
      assignedUserId?: string | null;
      tags?: {
        id: string;
        name: string;
        color: string;
      }[];
      tasks?: {
        id: string;
        completed: boolean;
      }[];
      startDate?: Date | null;
      dueDate?: Date | null;
    }[];
  }[];
  visibleFields: {
    title: boolean;
    priority: boolean;
    assignee: boolean;
    dueDate: boolean;
    tasks: boolean;
    tags: boolean;
  };
}

export const TableView = ({ data, visibleFields, users }: TableViewProps) => {
  const cardModal = useCardModal();
  const { currentWorkspace } = useCurrentWorkspace();
  const params = useParams();

  const allCards = data.flatMap((list) =>
    list.cards.map((card) => ({
      ...card,
      listTitle: list.title,
    }))
  );

  const PriorityIcon = (priority: string | null) => {
    if (!priority) {
      return null; // Si priority est null, ne rien afficher
    }
    if (priority === "LOW") {
      return <SignalLow className="text-green-500" size={25} />;
    }
    if (priority === "MEDIUM") {
      return <SignalMedium className="text-yellow-500" size={24} />;
    }
    if (priority === "HIGH") {
      return <SignalHigh className="text-orange-500" size={24} />;
    }
    if (priority === "CRITICAL") {
      return <AlertTriangle className="text-red-500" size={16} />;
    }
    return null; // Si aucune correspondance, ne rien afficher
  };

  const { execute: executeDeleteCard } = useAction(deleteCard, {
    onSuccess: (data) => {
      toast.success(`Card "${data.title}" deleted`);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onDelete = (cardId: string) => {
    const workspaceId = currentWorkspace?.id;

    if (!workspaceId) {
      toast.error("Workspace ID is required.");
      return;
    }

    executeDeleteCard({
      id: cardId,
      boardId: Array.isArray(params?.boardId) ? params.boardId[0] : params?.boardId || "",
      workspaceId,
    });
  };

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleFields.title && <TableHead className="font-semibold">Title</TableHead>}
              {visibleFields.priority && <TableHead className="font-semibold">Priority</TableHead>}
              {visibleFields.assignee && <TableHead className="font-semibold">Assigned To</TableHead>}
              {visibleFields.dueDate && <TableHead className="font-semibold">Due Date</TableHead>}
              {visibleFields.tasks && <TableHead className="font-semibold">Tasks</TableHead>}
              {visibleFields.tags && <TableHead className="font-semibold">Tags</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {allCards.map((card) => {
          
              return (
                <TableRow key={card.id} className="cursor-pointer hover:bg-gray-50" onClick={() => cardModal.onOpen(card.id)}>
                  {visibleFields.title && <TableCell className="font-medium">{card.title}</TableCell>}
                  {visibleFields.priority && (
                    <TableCell>
                      <div className="mr-1 flex items-center justify-center">
                        <Tooltip>
                          <TooltipTrigger>{PriorityIcon(card?.priority)}</TooltipTrigger>
                          <TooltipContent className="flex items-center justify-center">{card.priority}</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  )}
                  {visibleFields.assignee && (
                    <TableCell>
                      {card.assignedUserId && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={
                                  users.find((u: { id: string | null | undefined }) => u.id === card.assignedUserId)?.image || ""
                                }
                              />
                              <AvatarFallback>
                                {users.find((u: { id: string | null | undefined }) => u.id === card.assignedUserId)?.name?.[0] || (
                                  <UserRound size={12} />
                                )}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            {users.find((u: { id: string | null | undefined }) => u.id === card.assignedUserId)?.name || ""}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                  {visibleFields.dueDate && (
                    <TableCell>
                      {card.dueDate && (
                        <Button variant="ghost" className="gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(card.dueDate), "MMM d")}
                        </Button>
                      )}
                    </TableCell>
                  )}
                  {visibleFields.tasks && (
                    <TableCell>
                      {card.tasks && card.tasks.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <CheckSquare className="h-4 w-4" />
                            <span className="text-sm">
                              {card.tasks.filter((t) => t.completed).length}/{card.tasks.length}
                            </span>
                          </div>
                          <Progress
                            value={(card.tasks.filter((task) => task.completed).length / card.tasks.length) * 100}
                            className="h-1.5"
                          />
                        </div>
                      )}
                    </TableCell>
                  )}
                  {visibleFields.tags && (
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {card.tags?.map((tag) => (
                          <Badge key={tag.id} className="text-white" style={{ backgroundColor: tag.color }}>
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  )}
               
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="flex items-center justify-between" onClick={() => onDelete(card.id)}>
                          Delete
                          <Trash size={16} className="text-red-500" />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
