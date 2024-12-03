"use client";

import { useCardModal } from "@/hooks/use-card-modal";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useState } from "react";
import { ChevronDown, ChevronUp, Clock, LayoutList } from "lucide-react";

interface List {
  id: string;
  title: string;
  cards: Card[];
}

interface Card {
  id: string;
  title: string;
  order: number;
  description: string | null;
  listId: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: {
    id: string;
    name: string;
  }[];
}

interface TableViewProps {
  boardId: string;
  data: List[];
}

type SortField = "title" | "createdAt" | "tags" | "list";
type SortOrder = "asc" | "desc";

export const TableView = ({ boardId, data = [] }: TableViewProps) => {
  const cardModal = useCardModal();
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Flatten cards and add list information
  const flattenedCards = data.reduce((acc: (Card & { listTitle: string })[], list) => {
    const cardsWithList = list.cards.map(card => ({
      ...card,
      listTitle: list.title
    }));
    return [...acc, ...cardsWithList];
  }, []);

  const sortedData = [...flattenedCards].sort((a, b) => {
    if (sortField === "title") {
      return sortOrder === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else if (sortField === "createdAt") {
      return sortOrder === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortField === "tags") {
      const tagsA = a.tags?.length || 0;
      const tagsB = b.tags?.length || 0;
      return sortOrder === "asc" ? tagsA - tagsB : tagsB - tagsA;
    } else if (sortField === "list") {
      return sortOrder === "asc"
        ? a.listTitle.localeCompare(b.listTitle)
        : b.listTitle.localeCompare(a.listTitle);
    }
    return 0;
  });

  function getRandomColor(id: string): string {
    const colors = [
      "bg-red-500",
      "bg-green-500",
      "bg-blue-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const index = id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-gray-50/50 transition-colors">
            <TableHead 
              className="cursor-pointer font-semibold text-sm hover:text-black transition-colors"
              onClick={() => handleSort("title")}
            >
              <div className="flex items-center space-x-2">
                <span>Title</span>
                {sortField === "title" && (
                  sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer font-semibold text-sm hover:text-black transition-colors"
              onClick={() => handleSort("list")}
            >
              <div className="flex items-center space-x-2">
                <span>List</span>
                {sortField === "list" && (
                  sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer font-semibold text-sm hover:text-black transition-colors"
              onClick={() => handleSort("tags")}
            >
              <div className="flex items-center space-x-2">
                <span>Tags</span>
                {sortField === "tags" && (
                  sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer font-semibold text-sm hover:text-black transition-colors"
              onClick={() => handleSort("createdAt")}
            >
              <div className="flex items-center space-x-2">
                <span>Created</span>
                {sortField === "createdAt" && (
                  sortOrder === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item) => (
            <TableRow
              key={item.id}
              className="cursor-pointer group hover:bg-gray-50 transition-colors"
              onClick={() => cardModal.onOpen(item.id)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center space-x-2">
                  <span className="group-hover:text-blue-600 transition-colors">{item.title}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <LayoutList className="h-4 w-4" />
                  <span>{item.listTitle}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1.5 flex-wrap">
                  {item.tags?.map((tag) => (
                    <Badge
                      key={tag.id}
                      className={`${getRandomColor(tag.id)} text-white px-2 py-0.5 text-xs font-medium`}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};