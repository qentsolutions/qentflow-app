import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TableViewHeaderProps {
  sortField: "title" | "createdAt" | "tags" | "list";
  sortOrder: "asc" | "desc";
  onSort: (field: "title" | "createdAt" | "tags" | "list") => void;
}

export const TableViewHeader = ({
  sortField,
  sortOrder,
  onSort,
}: TableViewHeaderProps) => {
  return (
    <TableHeader>
      <TableRow className="hover:bg-gray-50/50 transition-colors">
        <TableHead
          className="cursor-pointer font-semibold text-sm hover:text-black transition-colors"
          onClick={() => onSort("title")}
        >
          <div className="flex items-center space-x-2">
            <span>Title</span>
            {sortField === "title" && (
              sortOrder === "asc" ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )
            )}
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer font-semibold text-sm hover:text-black transition-colors"
          onClick={() => onSort("list")}
        >
          <div className="flex items-center space-x-2">
            <span>List</span>
            {sortField === "list" && (
              sortOrder === "asc" ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )
            )}
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer font-semibold text-sm hover:text-black transition-colors"
          onClick={() => onSort("tags")}
        >
          <div className="flex items-center space-x-2">
            <span>Tags</span>
            {sortField === "tags" && (
              sortOrder === "asc" ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )
            )}
          </div>
        </TableHead>
        <TableHead
          className="cursor-pointer font-semibold text-sm hover:text-black transition-colors"
          onClick={() => onSort("createdAt")}
        >
          <div className="flex items-center space-x-2">
            <span>Created</span>
            {sortField === "createdAt" && (
              sortOrder === "asc" ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )
            )}
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};